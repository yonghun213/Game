
from playwright.sync_api import sync_playwright, expect
import re

def verify_timeline():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Login
        page.goto("http://localhost:3000")
        page.locator("label").filter(has_text="Alice Admin").click()
        page.get_by_role("button", name="Enter Platform").click()

        # 2. Go to Store Detail
        page.get_by_role("link", name="Mexico City Flagship").click()

        # Take debug screenshot
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/debug_store_detail.png", full_page=True)

        # 3. Verify Timeline View (Default)
        expect(page.get_by_role("heading", name="Mexico City Flagship")).to_be_visible()
        expect(page.get_by_role("button", name="Timeline")).to_be_visible()

        page.screenshot(path="verification/debug_store_loaded.png", full_page=True)

        # 4. Verify View Controls
        expect(page.get_by_text("Focus")).to_be_visible()
        expect(page.get_by_role("combobox")).to_be_visible() # Phase filter

        # 5. Switch to Calendar
        page.click("text=Calendar")
        expect(page.locator(".rbc-calendar")).to_be_visible()

        page.screenshot(path="verification/store_calendar_updated.png", full_page=True)
        print("Verification complete.")
        browser.close()

if __name__ == "__main__":
    verify_timeline()
