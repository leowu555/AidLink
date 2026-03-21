# save as get_cookies.py
import browser_cookie3
import json

cookies = browser_cookie3.chrome(domain_name=".x.com")
cookie_list = [
    {"name": c.name, "value": c.value, "domain": c.domain, "path": c.path}
    for c in cookies
]

with open("x_cookies.json", "w") as f:
    json.dump(cookie_list, f)

print(f"✅ Extracted {len(cookie_list)} cookies from Chrome")