const REGISTRATION_HEADERS = [
  'teamName',
  'leaderName',
  'email',
  'phone',
  'college',
  'teamSize',
  'member1',
  'member2',
  'member3',
  'member4',
  'house',
  'paymentId',
]

function doPost(event) {
  try {
    const registration = JSON.parse(event.postData.contents)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

    if (!sheet) {
      throw new Error('The spreadsheet does not have a sheet tab.')
    }

    const row = REGISTRATION_HEADERS.map((header) => registration[header] ?? '')
    const lock = LockService.getScriptLock()
    lock.waitLock(10000)

    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(REGISTRATION_HEADERS)
      }
      sheet.appendRow(row)
    } finally {
      lock.releaseLock()
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error(`Registration row was not saved: ${error.message}`)
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Could not save registration row.' }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
