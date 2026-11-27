/*
 * HackWarts shortlisted-team storage for the existing Apps Script web app.
 *
 * Paste this file into the same Apps Script project as Code.gs. Code.gs must
 * dispatch the three shortlist actions from doPost before its registration
 * handling (the matching dispatch is already included in this repository's
 * Code.gs).
 *
 * In Project Settings > Script Properties, set:
 *   SHORTLIST_STORAGE_SECRET = the same value as Vercel's
 *     APPS_SCRIPT_STORAGE_SECRET
 * In Vercel, also set APPS_SCRIPT_SHORTLIST_STORAGE_ENABLED=1 only after the
 * updated Apps Script deployment is live. This opt-in prevents an older
 * registration-only deployment from treating storage requests as registrations.
 * Optional for a standalone Apps Script project:
 *   SHORTLIST_SPREADSHEET_ID = the ID of the existing event spreadsheet
 * Then redeploy the web app and update Vercel's APPS_SCRIPT_URL if its /exec
 * deployment URL changed.
 */
function handleShortlistStorageAction_(data) {
  const supportedActions = ['shortlist_list', 'shortlist_upsert', 'shortlist_bulk_upsert'];
  if (!supportedActions.includes(data.action)) {
    return shortlistJson_({ success: false, error: 'Unsupported shortlist storage action.' });
  }

  const expectedSecret = PropertiesService.getScriptProperties().getProperty('SHORTLIST_STORAGE_SECRET');
  if (!expectedSecret || (data.storageSecret || data.secret) !== expectedSecret) {
    return shortlistJson_({ success: false, error: 'Shortlist storage authorization is not configured.' });
  }

  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SHORTLIST_SPREADSHEET_ID');
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    return shortlistJson_({ success: false, error: 'The shortlist spreadsheet is not configured.' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = spreadsheet.getSheetByName('ShortlistedTeams')
      || spreadsheet.insertSheet('ShortlistedTeams');
    const headers = ['team_id', 'record_json', 'updated_at'];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const actualHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      if (headers.some((header, index) => actualHeaders[index] !== header)) {
        throw new Error('The ShortlistedTeams tab has unexpected column headers.');
      }
    }

    if (data.action === 'shortlist_list') {
      const lastRow = sheet.getLastRow();
      const teams = lastRow < 2
        ? []
        : sheet.getRange(2, 1, lastRow - 1, headers.length).getValues()
          .map((row) => JSON.parse(row[1]))
          .filter((team) => team && typeof team.id === 'string');
      return shortlistJson_({ success: true, storageVersion: 'hackwarts-shortlist-v1', teams });
    }

    const teams = data.action === 'shortlist_upsert' ? [data.team] : data.teams;
    if (!Array.isArray(teams) || teams.length === 0 || teams.length > 500) {
      throw new Error('Provide between 1 and 500 shortlist records.');
    }
    if (teams.some((team) => !team || typeof team.id !== 'string' || !team.id)) {
      throw new Error('Every shortlist record must have a team ID.');
    }

    const lastRow = sheet.getLastRow();
    const storedRows = lastRow < 2
      ? []
      : sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    const rowById = new Map(storedRows.map((row, index) => [String(row[0]), index + 2]));
    const updates = new Map();
    const additions = [];
    const updatedAt = new Date().toISOString();
    for (const team of teams) {
      const row = [team.id, JSON.stringify(team), updatedAt];
      const existingRow = rowById.get(team.id);
      if (existingRow) updates.set(existingRow, row);
      else {
        const newRow = lastRow + additions.length + 1;
        rowById.set(team.id, newRow);
        additions.push(row);
      }
    }

    for (const [rowNumber, row] of updates) {
      sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
    }
    if (additions.length) {
      sheet.getRange(lastRow + 1, 1, additions.length, headers.length).setValues(additions);
    }
    return shortlistJson_({ success: true, storageVersion: 'hackwarts-shortlist-v1', count: teams.length });
  } catch (error) {
    return shortlistJson_({ success: false, error: error.message || 'Shortlist storage action failed.' });
  } finally {
    lock.releaseLock();
  }
}

function handleRegistrationsListAction_(data) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('SHORTLIST_STORAGE_SECRET');
  if (!expectedSecret || data.secret !== expectedSecret) {
    return shortlistJson_({ success: false, error: 'Registration list authorization is not configured.' });
  }
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SHORTLIST_SPREADSHEET_ID');
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) return shortlistJson_({ success: false, error: 'The registration spreadsheet is not configured.' });
  const sheet = spreadsheet.getSheetByName('Registrations') || spreadsheet.getSheets()[0];
  if (!sheet || sheet.getLastRow() < 2) return shortlistJson_({ success: true, headers: [], rows: [] });
  const values = sheet.getDataRange().getDisplayValues();
  const known = values[0].map((cell) => String(cell).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasHeader = known.some((cell) => ['teamname', 'leadername', 'email', 'team'].includes(cell));
  const headers = hasHeader
    ? values[0]
    : ['Timestamp', 'Team Name', 'Leader Name', 'Leader Email', 'Leader Phone', 'College', 'Team Size', 'Member 1', 'Member 2', 'Member 3', 'Member 4', 'Track', 'PPT Link', 'Status'];
  const rows = values.slice(hasHeader ? 1 : 0).filter((row) => row.some((cell) => String(cell).trim()));
  return shortlistJson_({ success: true, headers, rows });
}

function handleFeedbackSubmission_(data) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('SHORTLIST_STORAGE_SECRET');
  if (!expectedSecret || data.secret !== expectedSecret) {
    return shortlistJson_({ success: false, error: 'Feedback service authorization is not configured.' });
  }
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SHORTLIST_SPREADSHEET_ID');
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  const roster = spreadsheet && spreadsheet.getSheetByName('ShortlistedTeams');
  if (!roster || roster.getLastRow() < 2) {
    return shortlistJson_({ success: false, error: 'That team name is not in the confirmed paid roster.' });
  }

  const normalizedTeamName = String(data.teamName || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const records = roster.getRange(2, 1, roster.getLastRow() - 1, 2).getValues();
  const paidTeam = records.some((row) => {
    try {
      const team = JSON.parse(row[1]);
      return team && team.paymentStatus === 'PAID'
        && String(team.teamName || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedTeamName;
    } catch (_error) {
      return false;
    }
  });
  if (!paidTeam) {
    return shortlistJson_({ success: false, error: 'That team name is not in the confirmed paid roster.' });
  }

  const sheet = spreadsheet.getSheetByName('Feedback') || spreadsheet.insertSheet('Feedback');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Participant Name', 'Participant Email', 'Team Name', 'Team Leader Name', 'Domain', 'How Heard',
      'Overall Experience', 'Hackathon Experience', 'Evaluation Transparency', 'Venue Facilities', 'Mentor Session',
      'Mentor Feedback Usefulness', 'Evaluation 1', 'Evaluation 2', 'Evaluation 3', 'Future Improvements',
    ]);
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow([
      new Date(), data.participantName || '', data.email || '', data.teamName || '', data.leaderName || '', data.domain || '', data.hearAbout || '',
      data.overallExperience || '', data.hackathonExperience || '', data.evaluationTransparency || '', data.venueFacilities || '',
      data.mentorSessionRating || '', data.mentorFeedbackUsefulness || '', data.evaluation1Rating || '', data.evaluation2Rating || '',
      data.evaluation3Rating || '', data.futureImprovements || '',
    ]);
  } finally {
    lock.releaseLock();
  }
  return shortlistJson_({ success: true });
}

function shortlistJson_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
