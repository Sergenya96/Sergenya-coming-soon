// Google Apps Script — Email Signup Handler
// =========================================================
// HOW TO DEPLOY:
//
// 1. Go to https://script.google.com and create a new project.
// 2. Paste this entire file into the editor (replacing the default code).
// 3. Update SHEET_NAME and SPREADSHEET_ID below if needed.
// 4. Click "Deploy" → "New deployment" → Type: "Web app".
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the generated Web App URL.
// 6. Paste it into index.html where it says:
//    const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
// =========================================================

// The name of the sheet tab to store emails in.
const SHEET_NAME = 'Signups';

// Optional: hard-code your Spreadsheet ID here if you want to use a
// specific Google Sheet. Leave as '' to use the spreadsheet bound to
// this script (only works when the script is created inside a Sheet).
const SPREADSHEET_ID = '';

// -------------------------
// Handle POST requests from the signup form
// -------------------------
function doPost(e) {
  try {
    const email = (e.parameter.email || '').trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ status: 'error', message: 'Invalid email address.' });
    }

    const sheet = getOrCreateSheet();

    // Prevent duplicate signups
    const existingEmails = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .getValues()
      .flat()
      .map(String);

    if (existingEmails.includes(email)) {
      return jsonResponse({ status: 'success', message: 'Already subscribed!' });
    }

    // Append the new signup
    sheet.appendRow([email, new Date().toISOString()]);

    return jsonResponse({ status: 'success', message: 'Subscribed successfully!' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Server error: ' + err.message });
  }
}

// -------------------------
// Handle GET requests (optional health-check)
// -------------------------
function doGet() {
  return jsonResponse({ status: 'ok', message: 'Signup endpoint is live.' });
}

// -------------------------
// Helpers
// -------------------------
function getOrCreateSheet() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add header row
    sheet.appendRow(['Email', 'Timestamp']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  return sheet;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
