# QA Automation Test Execution Report

This report summarizes the E2E and Integration API tests executed for the **Fas_Food-App** and **Fas_Food-Backend** standalone repositories.

## Execution Summary

* **Execution Date**: June 24, 2026
* **Total Scenarios Checked**: 7
* **Passed**: 7 (100% Pass Rate)
* **Failed**: 0
* **Spreadsheet Report (Excel)**: [test_run_report.xlsx](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/test_run_report.xlsx)
* **HTML Report**: `playwright-report/index.html` (viewable locally)

---

## Detailed Test Case Coverage

### 1. Integration API Tests (Backend Verification)
Tests verified endpoints on `http://127.0.0.1:5000/api` using SQLite file-based fallback database.

| Test ID | Scenario Name | Status | Description / Validation |
| :--- | :--- | :--- | :--- |
| **TC-SEC-01** | Successful Cashier Login | **PASSED** | Validated that a pre-seeded cashier (`dorry`) receives a JWT token and successful message response. |
| **TC-SEC-02** | Failed Login (Invalid Credentials) | **PASSED** | Validated that incorrect cashier passwords reject authorization with status `401`. |
| **TC-CALC-01** | Chips Price Calculation & Category Routing | **PASSED** | Verified order price multiplication (e.g. quantity 3 * unit price 4.5 = 13.5 total) and correct category routing. |
| **TC-REP-01** | Cashier Sales Summary Retrieval | **PASSED** | Verified retrieval of sales summary analytics for active cashiers. |

### 2. E2E UI Tests (Frontend Verification)
Tests executed in Chromium headless mode on Expo Web client served at `http://localhost:8081`.

| Test ID | Scenario Name | Status | Description / Validation |
| :--- | :--- | :--- | :--- |
| **TS-LOGIN-01** | Verify Login Screen loads successfully | **PASSED** | Checked that all role selection tabs, branding text, and credentials input fields load correctly on page initialization. |
| **TS-LOGIN-02** | Verify Login flow with Owner account | **PASSED** | Signed in as Owner, verified transition to home navigation page, and visibility of administrative controls. |
| **TS-STORE-01** | Verify Store Management (Add & Delete Items) | **PASSED** | Navigated to Store Management tab, toggled the add product form, added a burger item, verified list placement, and deleted the item with alert validation. |

---

## Technical Details and Artifacts

* **Test Config**: [playwright.config.js](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/playwright.config.js)
* **API Spec**: [api-tests.spec.js](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/tests/api-tests.spec.js)
* **E2E Spec**: [frontend-tests.spec.js](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/tests/frontend-tests.spec.js)
* **Jira Reporter Integration**: [jira-reporter.js](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/jira-reporter.js)
* **Excel Exporter**: [report-to-excel.js](file:///c:/Users/yaqoob/Desktop/Automation/Fas_Food-App/playwright-tests/report-to-excel.js)

---
*Report compiled automatically by the Antigravity QA automation pipeline.*
