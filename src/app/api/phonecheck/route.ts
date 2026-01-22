import { NextRequest, NextResponse } from 'next/server';

const PHONECHECK_USERNAME = process.env.PHONECHECK_USERNAME || '';
const PHONECHECK_PASSWORD = process.env.PHONECHECK_PASSWORD || '';

async function getAuthToken(): Promise<string> {
  const response = await fetch('https://api.phonecheck.com/v2/auth/master/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: PHONECHECK_USERNAME, 
      password: PHONECHECK_PASSWORD 
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Login failed: ' + errorText);
  }
  
  const data = await response.json();
  return data.token;
}

async function fetchPhoneData(imei: string, token: string): Promise<any> {
  const url = `https://api.phonecheck.com/v2/master/imei/device-info-legacy/${imei}?detailed=true`;
  const response = await fetch(url, {
    headers: { 'token_master': token }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Device info request failed: ' + errorText);
  }
  
  return await response.json();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  } catch (e) {
    return String(dateStr);
  }
}

function abstractData(rawData: any): any {
  const raw = Array.isArray(rawData) ? rawData[0] : rawData;

  if (!raw) {
    return {
      title: '', model: '', model_name: '', imei: '', serial: '', carrier: '',
      sim_lock: '', color: '', memory: '', first_received: '', latest_update: '', working: '',
      battery_health: '', bcc: '', mdm: '', grade: '', notes: '', failed: '',
      tester_name: '', repair_notes: '', ram: ''
    };
  }

  let esnResponse: any = null;
  if (raw.ESNResponse) {
    try {
      esnResponse = typeof raw.ESNResponse === 'string' ? JSON.parse(raw.ESNResponse) : raw.ESNResponse;
    } catch (e) {
      console.error('Error parsing ESNResponse:', e);
      esnResponse = null;
    }
  }

  let carrierFromESN = '';
  let financeType = '';
  
  // Handle carrier extraction (for backward compatibility)
  if (Array.isArray(esnResponse)) {
    const carrierObj = esnResponse.find((e: any) => e.Carrier);
    if (carrierObj) {
      carrierFromESN = carrierObj.Carrier;
    }
  }
  
  // Extract Finance Type from esnApiResults
  // ESNResponse structure: { esnApiResults: [{ RawResponse: "Finance Type: LOANOperating..." }] }
  if (esnResponse && typeof esnResponse === 'object') {
    let esnApiResults: any[] = [];
    
    // Check if esnResponse has esnApiResults property
    if (esnResponse.esnApiResults && Array.isArray(esnResponse.esnApiResults)) {
      esnApiResults = esnResponse.esnApiResults;
    } 
    // Fallback: if esnResponse itself is an array
    else if (Array.isArray(esnResponse)) {
      esnApiResults = esnResponse;
    }
    
    // Search through results for Finance Type
    for (const result of esnApiResults) {
      if (result && result.RawResponse && typeof result.RawResponse === 'string') {
        // Primary regex pattern: Finance Type: LOANOperating...
        let match = result.RawResponse.match(/Finance\s+Type:\s*([A-Za-z]+)(?=Operating|eSIM|ESN|$)/i);
        if (match && match[1]) {
          financeType = match[1].trim();
          break;
        }
        // Fallback pattern: Finance Type: LOAN (with space or newline after)
        match = result.RawResponse.match(/Finance\s+Type:\s*([A-Za-z]+)(?:\s|$)/i);
        if (match && match[1]) {
          financeType = match[1].trim();
          break;
        }
      }
    }
  }

  return {
    title: String((raw.Model || '') + (raw.Memory ? ' ' + raw.Memory : '')).toUpperCase(),
    model: String(raw["Model#"] || ''),
    model_name: String(raw.Model || ''),
    imei: String(raw.IMEI || ''),
    serial: String(raw.Serial || ''),
    carrier: String(raw.Carrier || carrierFromESN || ''),
    sim_lock: '',
    color: String(raw.Color || ''),
    memory: String(raw.Memory || ''),
    ram: String(raw.Ram || ''),
    first_received: String(formatDate(raw.DeviceCreatedDate) || ''),
    latest_update: String(formatDate(raw.DeviceUpdatedDate) || ''),
    working: String(raw.Working || ''),
    battery_health: String(raw.BatteryHealthPercentage || ''),
    bcc: String(raw.BatteryCycle || ''),
    mdm: String(raw.MDM || ''),
    grade: String(raw.Grade || ''),
    notes: String(raw.Notes || ''),
    failed: String(raw.Failed || ''),
    tester_name: String(raw.TesterName || ''),
    repair_notes: String(raw.Custom1 || ''),
    finance_type: financeType || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { imei } = await request.json();
    
    if (!imei) {
      return NextResponse.json(
        { error: 'IMEI is required' },
        { status: 400 }
      );
    }

    const token = await getAuthToken();
    const rawData = await fetchPhoneData(imei, token);
    const data = abstractData(rawData);
    data._rawData = rawData;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Phonecheck API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch device data' },
      { status: 500 }
    );
  }
}
