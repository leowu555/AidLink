"""
scheduler.py
────────────
Runs the scraper (main.py) every hour, then restarts the analyst
agent to kick off the full analysis pipeline.

Keep this running in a separate terminal alongside your 3 agents.

Usage: python scheduler.py

.env required:
    INTERVAL_MINUTES=60   (optional, defaults to 60)
"""

import asyncio
import os
import subprocess
import sys
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

INTERVAL_MINUTES = int(os.getenv("INTERVAL_MINUTES", "60"))
INTERVAL_SECONDS = INTERVAL_MINUTES * 60

# Path to your scripts — assumes scheduler.py is in the same directory
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
SCRAPER      = os.path.join(BASE_DIR, "test_pipeline.py")
UPLOADER     = os.path.join(BASE_DIR, "upload_to_supabase.py")
ANALYST      = os.path.join(BASE_DIR, "analyst.py")
PYTHON       = sys.executable

analyst_process = None


def log(msg: str):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


def run_scraper() -> bool:
    """Run main.py synchronously and wait for it to finish."""
    log("🔍 Starting scraper (main.py)...")
    try:
        result = subprocess.run(
            [PYTHON, SCRAPER],
            cwd=BASE_DIR,
            timeout=3000,   # 50 min max — adjust if scraper takes longer
        )
        if result.returncode == 0:
            log("✅ Scraper finished successfully")
            return True
        else:
            log(f"⚠️  Scraper exited with code {result.returncode}")
            return False
    except subprocess.TimeoutExpired:
        log("❌ Scraper timed out after 50 minutes")
        return False
    except Exception as e:
        log(f"❌ Scraper failed: {e}")
        return False


def restart_analyst():
    """Kill existing analyst process and start a fresh one."""
    global analyst_process

    if analyst_process and analyst_process.poll() is None:
        log("🛑 Stopping existing analyst agent...")
        analyst_process.terminate()
        try:
            analyst_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            analyst_process.kill()

    log("🚀 Starting analyst agent...")
    analyst_process = subprocess.Popen(
        [PYTHON, ANALYST],
        cwd=BASE_DIR,
    )
    log(f"✅ Analyst started (pid={analyst_process.pid})")


async def run_cycle():
    log(f"{'═' * 50}")
    log(f"⏰ Starting scheduled cycle")
    log(f"{'═' * 50}")

    scraper_ok = run_scraper()

    # upload fresh JSONs to Supabase regardless of scraper status
    log("📤 Uploading incidents to Supabase...")
    try:
        result = subprocess.run(
            [PYTHON, UPLOADER],
            cwd=BASE_DIR,
            timeout=120,
        )
        if result.returncode == 0:
            log("✅ Upload complete")
        else:
            log(f"⚠️  Upload exited with code {result.returncode}")
    except Exception as e:
        log(f"❌ Upload failed: {e}")

    log("🤖 Triggering analysis pipeline...")
    restart_analyst()

    log(f"✅ Cycle complete. Next run in {INTERVAL_MINUTES} minutes.")


async def main():
    log(f"📅 Scheduler started — running every {INTERVAL_MINUTES} minutes")
    log(f"   Scraper:  {SCRAPER}")
    log(f"   Analyst:  {ANALYST}")
    log(f"   Press Ctrl+C to stop")

    while True:
        await run_cycle()
        log(f"💤 Sleeping for {INTERVAL_MINUTES} minutes...")
        await asyncio.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("🛑 Scheduler stopped")
        if analyst_process and analyst_process.poll() is None:
            analyst_process.terminate()