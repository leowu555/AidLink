import asyncio
import json
import re
import os
from datetime import datetime
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

gemini_model = "gemini-2.5-flash"

import time

def call_gemini(prompt: str) -> str:
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=gemini_model,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            if "429" in str(e):
                # Parse wait time from error message if available
                wait = 60 * (attempt + 1)
                print(f"  ⏳ Rate limited. Waiting {wait}s... (attempt {attempt+1}/3)")
                time.sleep(wait)
            else:
                raise e
    raise Exception("Gemini failed after 3 retries")

# ── STEP 1: Gemini generates search queries ──────────────────────────────────
def generate_queries(crisis_context: str) -> list[str]:
    prompt = f"""
    You are helping a humanitarian crisis response tool find people who need rescue or aid.
    
    Crisis context: {crisis_context}
    
    Generate 5 Twitter/X search queries to find:
    - People trapped or needing evacuation
    - Requests for food, water, or medical help
    - Missing persons reports
    - SOS signals
    
    Rules:
    - Include relevant local language terms (Arabic if Middle East, etc.)
    - Keep each query under 500 characters
    - Use Twitter search operators (OR, -is:retweet, etc.)
    - Return ONLY a JSON array of query strings, nothing else
    
    Example format: ["query1", "query2", "query3"]
    """
    
    text = call_gemini(prompt).replace("```json", "").replace("```", "")
    queries = json.loads(text)
    print(f"\n✅ Gemini generated {len(queries)} queries:")
    for q in queries:
        print(f"   • {q}")
    return queries

# ── STEP 2: Playwright scrapes X ─────────────────────────────────────────────
async def scrape_twitter(queries: list[str], max_tweets_per_query: int = 10) -> list[dict]:
    all_tweets = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        # Load cookies from Chrome
        with open("x_cookies.json") as f:
            cookies = json.load(f)
        await context.add_cookies(cookies)

        page = await context.new_page()
        print("⏳ Loading X with saved session...")
        await page.goto("https://x.com/home")
        await page.wait_for_timeout(3000)

        # Verify logged in
        if "login" in page.url:
            print("❌ Cookies didn't work — try logging into Chrome and re-running get_cookies.py")
            await browser.close()
            return []

        print("✅ Logged in via cookies!")
        
        for query in queries:
            print(f"\n🔍 Scraping: {query[:60]}...")
            
            # Encode query for URL
            encoded = query.replace(" ", "%20").replace("#", "%23").replace(":", "%3A")
            url = f"https://x.com/search?q={encoded}&src=typed_query&f=live"
            
            await page.goto(url)
            await page.wait_for_timeout(3000)
            
            tweets_found = 0
            last_height = 0
            
            while tweets_found < max_tweets_per_query:
                # Grab all tweet text elements
                tweet_elements = await page.query_selector_all('article[data-testid="tweet"]')
                
                for el in tweet_elements:
                    if tweets_found >= max_tweets_per_query:
                        break
                    try:
                        text_el = await el.query_selector('[data-testid="tweetText"]')
                        time_el = await el.query_selector("time")
                        
                        if not text_el:
                            continue
                            
                        text = await text_el.inner_text()
                        timestamp = await time_el.get_attribute("datetime") if time_el else None
                        
                        # Avoid duplicates
                        if not any(t["text"] == text for t in all_tweets):
                            all_tweets.append({
                                "text": text,
                                "timestamp": timestamp,
                                "query_used": query,
                                "scraped_at": datetime.utcnow().isoformat(),
                            })
                            tweets_found += 1
                            print(f"   [{tweets_found}] {text[:70]}...")
                    except:
                        continue
                
                # Scroll down to load more
                current_height = await page.evaluate("document.body.scrollHeight")
                if current_height == last_height:
                    break  # No more tweets loading
                last_height = current_height
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(2000)
        
        await browser.close()
    
    print(f"\n📦 Total tweets scraped: {len(all_tweets)}")
    return all_tweets

# ── STEP 3: Gemini parses each tweet ─────────────────────────────────────────
def parse_tweets(tweets: list[dict]) -> list[dict]:
    results = []
    
    # Batch tweets to save API calls
    batch_size = 10
    for i in range(0, len(tweets), batch_size):
        batch = tweets[i:i+batch_size]
        batch_text = "\n---\n".join(
            f"[{j+1}] {t['text']}" for j, t in enumerate(batch)
        )
        
        prompt = f"""
        You are a humanitarian crisis analyst. Analyze these tweets and extract structured information.
        
        Tweets:
        {batch_text}
        
        For each tweet return a JSON array where each object has:
        - "index": tweet number (1-based)
        - "is_rescue_request": true/false — is someone actively asking for help?
        - "urgency": "critical" | "high" | "medium" | "low" | "none"
        - "needs": array of strings e.g. ["food", "water", "medical", "evacuation", "rescue"]
        - "location_mentions": array of place names mentioned
        - "language": detected language code e.g. "en", "ar"
        - "summary": one sentence in English describing the situation
        
        Return ONLY valid JSON array, no markdown, no explanation.
        """
        
        try:
            text = call_gemini(prompt).replace("```json", "").replace("```", "")
            parsed = json.loads(text)
            
            for p in parsed:
                idx = p["index"] - 1
                if idx < len(batch):
                    results.append({
                        **batch[idx],
                        **p,
                    })
                    if p["is_rescue_request"]:
                        print(f"  🚨 [{p['urgency'].upper()}] {p['summary']}")
        except Exception as e:
            print(f"  ⚠️ Parse error on batch {i}: {e}")
            continue
    
    return results

# ── STEP 4: Filter & save ────────────────────────────────────────────────────
def save_results(results: list[dict]):
    # Filter to only actionable rescue requests
    actionable = [r for r in results if r.get("is_rescue_request")]
    
    out = {
        "generated_at": datetime.utcnow().isoformat(),
        "total_scraped": len(results),
        "rescue_requests": len(actionable),
        "data": actionable,
    }
    
    filename = f"crisis_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ {len(actionable)} rescue requests saved to {filename}")
    return filename

# ── Main ──────────────────────────────────────────────────────────────────────
async def main():
    crisis_context = "Gaza Strip, conflict zone, people needing rescue, medical aid, food and water"
    
    # 1. Gemini generates queries
    queries = generate_queries(crisis_context)
    
    # 2. Playwright scrapes X
    tweets = await scrape_twitter(queries, max_tweets_per_query=10)
    
    if not tweets:
        print("❌ No tweets scraped — X may have blocked or login failed")
        return
    
    # 3. Gemini parses tweets
    print("\n🤖 Sending tweets to Gemini for analysis...")
    results = parse_tweets(tweets)
    
    # 4. Save
    save_results(results)

if __name__ == "__main__":
    asyncio.run(main())