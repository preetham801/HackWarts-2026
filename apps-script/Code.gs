const PPT_FOLDER_ID = '1QCPmQoyK2lStsTiXAaBvgN4sDWzftpf4';

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Registrations')
      || spreadsheet.getSheets()[0];

    // Decode the base64 deck and save it to the designated Drive folder.
    let pptFileUrl = 'No file uploaded';
    if (data.pptBase64 && data.pptFileName) {
      const folder = DriveApp.getFolderById(PPT_FOLDER_ID);
      const safeTeamName = (data.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeTeamName}_${data.pptFileName}`;
      const decodedBytes = Utilities.base64Decode(data.pptBase64);
      const blob = Utilities.newBlob(
        decodedBytes,
        data.pptMimeType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        fileName
      );
      const savedFile = folder.createFile(blob);
      savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      pptFileUrl = savedFile.getUrl();
    }

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss');
    const row = [
      timestamp,
      data.teamName || '',
      data.leaderName || '',
      data.email || '',
      data.phone || '',
      data.college || '',
      data.teamSize || '',
      data.member1 || '',
      data.member2 || '',
      data.member3 || '',
      data.member4 || '',
      data.house || 'No Preference',
      pptFileUrl,
      'REGISTERED - ROUND 1',
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    if (data.email) {
      const subject = `HackWarts 2026 — Round 1 Registration Confirmed (${data.teamName})`;
      const body = [
        `Greetings ${data.leaderName || 'Wizard'},`,
        '',
        `Your coven "${data.teamName}" has been officially registered for Round 1 of HackWarts 2026!`,
        '',
        'Registration Summary:',
        `• Team Name: ${data.teamName}`,
        `• Team Leader: ${data.leaderName}`,
        `• College: ${data.college}`,
        `• Team Size: ${data.teamSize}`,
        `• House Preference: ${data.house || 'No Preference'}`,
        `• Submitted Project PPT: ${pptFileUrl}`,
        '',
        'Our organizing council will review your project deck and notify you regarding Round 2 qualification and payment details shortly.',
        '',
        'Warm regards,',
        'Team RezonX — HackWarts 2026 Organizing Council',
      ].join('\n');

      MailApp.sendEmail({
        to: data.email,
        subject,
        body,
        name: 'HackWarts 2026 | Team RezonX',
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, pptUrl: pptFileUrl }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(`Registration error: ${error.message}`);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
