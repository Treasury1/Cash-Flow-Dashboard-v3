
declare const google: any;

const CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.metadata.readonly';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if we have a valid cached token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return resolve(accessToken);
    }

    try {
      if (!CLIENT_ID) {
        throw new Error('VITE_GOOGLE_CLIENT_ID is not configured in environment variables.');
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            accessToken = response.access_token;
            // Token typically expires in 3600 seconds. We'll set it to 50 mins to be safe.
            tokenExpiry = Date.now() + 50 * 60 * 1000;
            resolve(response.access_token);
          } else {
            console.error('OAuth Response Error:', response);
            reject(new Error('Failed to get access token: ' + (response.error_description || response.error || 'Unknown error')));
          }
        },
        error_callback: (err: any) => {
          console.error('OAuth Error Callback:', err);
          reject(new Error(err.message || 'OAuth interaction failed. Please check if popups are allowed.'));
        }
      });
      client.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
};

export const searchSpreadsheets = async (): Promise<{ id: string; name: string }[]> => {
  const token = await getAccessToken();
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.spreadsheet\'&pageSize=15&orderBy=modifiedTime desc&fields=files(id, name)',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Google Drive API Error: ${errorBody.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};

export interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

export const fetchSheetData = async (spreadsheetId: string, range: string): Promise<string[][]> => {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Google Sheets API Error: ${errorBody.error?.message || response.statusText}`);
  }

  const data: SheetData = await response.json();
  return data.values || [];
};

export const parseCashBalanceSheetData = (values: string[][]) => {
  if (values.length < 2) return [];

  const headers = values[0].map(h => h.trim().toUpperCase());
  const rows = values.slice(1);

  return rows.map((row, index) => {
    const entry: any = {};
    headers.forEach((header, i) => {
      entry[header] = row[i];
    });

    // Indonesian and English aliases for common headers
    const findValue = (aliases: string[]) => {
      const alias = aliases.find(a => entry[a] !== undefined);
      return alias ? entry[alias] : null;
    };

    const bank = findValue(['BANK', 'BANK NAME', 'NAMA BANK', 'INSTITUSI']) || '';
    const bankStr = bank.toString().trim();
    if (!bankStr || bankStr === '') return null;

    const accountNo = findValue(['ACCOUNT NO.', 'ACC NO', 'NOMOR REKENING', 'NO REK']) || 'N/A';
    const endingBalanceStr = findValue(['ENDING BALANCE', 'SALDO AKHIR', 'BALANCE', 'SALDO'])?.toString() || '0';
    const endingBalance = parseFloat(endingBalanceStr.replace(/,/g, '').replace(/IDR/g, '').trim());
    
    const dateValue = findValue(['DATE', 'TANGGAL', 'TGL']) || new Date().toISOString().split('T')[0];
    let dateStr = dateValue.toString().trim();
    
    // Normalize date format to YYYY-MM-DD
    let normalizedDate = dateStr;
    if (dateStr.includes('/') || dateStr.includes('-')) {
      const parts = dateStr.split(/[/-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) { // YYYY-MM-DD
          normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else { // DD-MM-YYYY
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    } else if (!isNaN(Date.parse(dateStr))) {
      normalizedDate = new Date(dateStr).toISOString().split('T')[0];
    }

    return {
      id: `sheet-cb-${Date.now()}-${index}`,
      bank: bankStr,
      accountNo: accountNo.toString(),
      endingBalance: isNaN(endingBalance) ? 0 : endingBalance,
      date: normalizedDate
    };
  }).filter(row => row !== null);
};

export const parseSheetData = (values: string[][]) => {
  if (values.length < 2) return [];

  const headers = values[0].map(h => h.trim().toUpperCase());
  const rows = values.slice(1);

  return rows.map((row, index) => {
    const entry: any = {};
    headers.forEach((header, i) => {
      entry[header] = row[i];
    });

    const dateStr = entry['DATE'];
    const bank = entry['BANK'] || 'Others';
    const category = entry['CATEGORY'] || 'Others';
    const amount = parseFloat(entry['AMOUNT']?.replace(/,/g, '') || '0');
    const type = entry['TYPE'] || 'Inflow';
    const month = entry['MONTH'] || (dateStr ? new Date(dateStr).toLocaleString('default', { month: 'long' }) : 'Unknown');

    return {
      id: Date.now() + index,
      date: dateStr,
      bank,
      category,
      amount: Math.abs(amount),
      type,
      month
    };
  });
};
