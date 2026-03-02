function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.sheet || "Activity Log";

    // Special handling for Session State — upsert by key
    if (sheetName === "Session State") {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Key", "State", "Updated"]);
        sheet.getRange(1, 1, 1, 3)
          .setBackground("#4472C4")
          .setFontColor("#ffffff")
          .setFontWeight("bold");
      }
      var key = data.key || "default";
      var stateJson = JSON.stringify(data.state);
      var timestamp = new Date().toISOString();

      // Find existing row with this key and overwrite, or append new
      var values = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(stateJson);
          sheet.getRange(i + 1, 3).setValue(timestamp);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, stateJson, timestamp]);
      }

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Regular sheet append (existing behavior)
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var h = {
        "Activity Log":      ["Date","Student","App","Activity","Score","Max Score","Percent","Notes"],
        "Reading - ORF":     ["Date","Passage","WCPM","Words Read","Errors","Self-Corrections","Accuracy","Expression","Phrasing","Pace","Smoothness","Prosody Avg","Notes"],
        "Reading - Phonics": ["Date","Section","Standard","Correct","Total","Percent","Error Words","Notes"],
        "Writing":           ["Date","App","Activity","Score","Max Score","Percent","Word Count","Connecting Words","Notes"]
      };
      if (h[sheetName]) {
        sheet.appendRow(h[sheetName]);
        sheet.getRange(1, 1, 1, h[sheetName].length)
          .setBackground("#4472C4")
          .setFontColor("#ffffff")
          .setFontWeight("bold");
      }
    }

    sheet.appendRow(data.row);

    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';

  // Load session state — returns JSONP so it works cross-origin
  if (action === 'loadState') {
    var key = e.parameter.key || 'default';
    var callback = e.parameter.callback || 'cloudCallback';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Session State');

    var result = { success: false, state: null };

    if (sheet) {
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] === key) {
          try {
            result = { success: true, state: JSON.parse(values[i][1]), updated: values[i][2] };
          } catch(ex) {
            result = { success: false, error: 'parse error' };
          }
          break;
        }
      }
    }

    // JSONP response — browser follows the Apps Script redirect for script tags
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput("Marcello Tutoring Tracker - running OK.")
    .setMimeType(ContentService.MimeType.TEXT);
}
