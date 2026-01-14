import { DeviceData } from '@/types';
import { formatDate } from './utils';

const PHONECHECK_USERNAME = process.env.PHONECHECK_USERNAME || '';
const PHONECHECK_PASSWORD = process.env.PHONECHECK_PASSWORD || '';

/**
 * Get authentication token from Phonecheck API
 */
export async function getAuthToken(): Promise<string> {
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

/**
 * Fetch device data from Phonecheck API
 */
export async function fetchPhoneData(imei: string, token: string): Promise<any> {
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

/**
 * Abstract/transform Phonecheck API response to DeviceData format
 */
export function abstractData(rawData: any): DeviceData {
  const raw = Array.isArray(rawData) ? rawData[0] : rawData;

  if (!raw) {
    return {
      title: '', model: '', model_name: '', imei: '', serial: '', carrier: '',
      sim_lock: '', color: '', memory: '', first_received: '', latest_update: '', working: '',
      battery_health: '', bcc: '', mdm: '', grade: '', notes: '', failed: '',
      tester_name: '', repair_notes: '', ram: ''
    };
  }

  let esnResponse: any[] = [];
  if (raw.ESNResponse) {
    try {
      esnResponse = typeof raw.ESNResponse === 'string' ? JSON.parse(raw.ESNResponse) : raw.ESNResponse;
    } catch (e) {
      esnResponse = [];
    }
  }

  let carrierFromESN = '';
  if (Array.isArray(esnResponse)) {
    const carrierObj = esnResponse.find((e: any) => e.Carrier);
    if (carrierObj) {
      carrierFromESN = carrierObj.Carrier;
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
  };
}
