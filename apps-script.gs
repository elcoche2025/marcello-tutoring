function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetName = data.sheet || "Activity Log";
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
  return ContentService
    .createTextOutput("Marcello Tutoring Tracker - running OK.")
    .setMimeType(ContentService.MimeType.TEXT);
}
