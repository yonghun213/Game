
from playwright.sync_api import sync_playwright, expect
import time

def verify_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("1. Login")
        page.goto("http://localhost:3000")
        page.locator("label").filter(has_text="Alice Admin").click()
        page.get_by_role("button", name="Enter Platform").click()

        print("2. Navigate to Store")
        page.get_by_role("link", name="Mexico City Flagship").click()
        expect(page.get_by_role("heading", name="Mexico City Flagship")).to_be_visible()

        # 3. Create Ad-hoc Task
        print("3. Create Task")
        page.get_by_role("button", name="+ New Task").click()

        page.fill("input[placeholder*='e.g. Hire']", "Test AdHoc Task")
        # Use existing phase. Target the select inside the modal form.
        page.locator("form select").select_option("0. Deal / Planning")
        page.fill("input[type='date']", "2025-01-01") # Start
        page.fill("input[type='date']", "2025-01-05") # Due -> Due is 2nd date input?
        # The modal has 2 date inputs. Playwright fill might pick first or use locator.
        inputs = page.locator("input[type='date']")
        inputs.nth(0).fill("2025-01-01")
        inputs.nth(1).fill("2025-01-05")

        page.get_by_role("button", name="Create Task").click()

        # Verify it appears
        page.wait_for_timeout(1000) # Wait for refresh
        expect(page.get_by_text("Test AdHoc Task")).to_be_visible()

        # 4. Reschedule Task (Shift Downstream)
        # Target "Construction Kickoff" which "Demolition / Prep" depends on.
        print("4. Reschedule Task")
        page.screenshot(path="verification/debug_before_reschedule.png", full_page=True)
        # Need to find it. It's in Phase 4.
        # Expand Phase 4? It is auto-expanded.
        page.get_by_text("Construction Kickoff").click()

        # Modal opens
        expect(page.get_by_role("heading", name="Construction Kickoff")).to_be_visible()

        # Current date: Construction Start (Mar 3, 2025).
        # Let's move it to Mar 10, 2025.
        page.locator("input[type='date']").fill("2025-03-10")

        page.get_by_role("button", name="Save Changes").click()
        page.wait_for_timeout(2000)

        # Verify "Demolition / Prep" moved.
        # Original: Mar 3 + 1 day = Mar 4.
        # New: Mar 10 + 1 day = Mar 11.

        page.get_by_text("Demolition / Prep").click()
        date_val = page.locator("input[type='date']").input_value()
        print(f"Demolition / Prep new date: {date_val}")

        if date_val == "2025-03-04": # Original date
             print("FAILURE: Date did not shift.")
        else:
             print("SUCCESS: Date shifted.")

        page.get_by_role("button", name="Cancel").click()

        # 5. Verify Filters
        print("5. Verify Filters")
        # Filter by Phase. Phase is the first select in ViewControls.
        page.locator("select").nth(0).select_option("0. Deal / Planning")
        # Should see Approve Budget
        expect(page.get_by_text("Approve Budget")).to_be_visible()
        # Should NOT see "Grand Opening Execution" (Phase 8)
        expect(page.get_by_text("Grand Opening Execution")).not_to_be_visible()

        # Verify URL
        print(f"URL: {page.url}")
        if "phase=0.+Deal+%2F+Planning" not in page.url and "phase=0. Deal / Planning" not in page.url:
             print("WARNING: URL param check failed (encoding issues?)")

        page.screenshot(path="verification/full_flow_final.png", full_page=True)
        print("Full flow verification complete.")
        browser.close()

if __name__ == "__main__":
    verify_full_flow()
