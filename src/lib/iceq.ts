import { DeviceData } from '@/types';
import { formatDate } from './utils';

const ICEQ_CONFIG = {
  company: process.env.ICEQ_COMPANY || '',
  version: process.env.ICEQ_VERSION || 'v2_8_1',
  license: process.env.ICEQ_LICENSE || '',
  bearer: process.env.ICEQ_BEARER || '',
  baseUrl: `https://${process.env.ICEQ_COMPANY || ''}.apiq.icedb.com/api/${process.env.ICEQ_VERSION || 'v2_8_1'}/q`
};

/**
 * Fetch device data from ICE Q API
 */
export async function fetchIceQData(imeiOrSerial: string): Promise<any> {
  const url = `${ICEQ_CONFIG.baseUrl}/transaction_imei_request`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Bearer': ICEQ_CONFIG.bearer,
      'License': ICEQ_CONFIG.license
    },
    body: JSON.stringify({ imei: imeiOrSerial })
  });
  
  if (response.status === 204) {
    return null;
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ICE Q API request failed: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Map ICE Q API response to DeviceData format
 */
export function mapIceQDataToDisplay(rawData: any): DeviceData {
  let raw;
  if (Array.isArray(rawData) && rawData.length > 0) {
    raw = rawData[rawData.length - 1];
  } else {
    raw = rawData;
  }
  
  if (!raw) {
    return {
      title: '', model: '', model_name: '', imei: '', serial: '', carrier: '',
      sim_lock: '', color: '', memory: '', first_received: '', latest_update: '', working: '',
      battery_health: '', bcc: '', mdm: '', grade: '', notes: '', failed: '',
      tester_name: '', repair_notes: '', ram: ''
    };
  }

  function formatDateSafe(dateStr: any): string {
    if (!dateStr) return '';
    try {
      const dateStrSafe = String(dateStr);
      const parts = dateStrSafe.split('/');
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        if (!isNaN(d.getTime())) {
          return d.toISOString().replace('T', ' ').substring(0, 16);
        }
      }
    } catch (e) {}
    return String(dateStr);
  }

  const getField = (...fieldNames: string[]): string => {
    for (const field of fieldNames) {
      if (raw[field] !== undefined && raw[field] !== null && raw[field] !== '') {
        return String(raw[field]);
      }
    }
    return '';
  };

  let workingStatus = '';
  const functionalityValue = getField('device_functionality', 'DeviceFunctionality', 'deviceFunctionality', 
                                      'testing_finished', 'testingFinished', 'working', 'Working', 'status', 'Status');
  const functionality = functionalityValue.toLowerCase();
  
  if (functionality === 'pass' || functionality === 'pass*' || functionality === 'yes') {
    workingStatus = 'yes';
  } else if (functionality === 'fail' || functionality === 'fail*' || functionality === 'no') {
    workingStatus = 'no';
  } else if (functionality === 'incomplete' || functionality === 'incomplete*' || functionality === 'pending') {
    workingStatus = 'pending';
  }

  const latestUpdate = (raw.date && raw.time) 
    ? `${raw.date} ${raw.time}` 
    : (raw.date || raw.time || '');

  return {
    title: String((getField('marketing_name', 'MarketingName', 'marketingName') || 
                   getField('model', 'Model') || '') + 
                  (getField('memory_size', 'MemorySize', 'memorySize') ? ' ' + getField('memory_size', 'MemorySize', 'memorySize') : '')).toUpperCase(),
    model: getField('model', 'Model', 'product', 'Product'),
    model_name: getField('marketing_name', 'MarketingName', 'marketingName', 'model', 'Model'),
    imei: getField('imei', 'IMEI', 'Imei'),
    serial: getField('serial', 'Serial', 'serial_number', 'SerialNumber'),
    carrier: getField('carrier', 'Carrier', 'carrier_name', 'CarrierName'),
    sim_lock: getField('sim_lock', 'SimLock', 'simLock', 'sim_lock_status', 'SimLockStatus'),
    color: getField('color', 'Color', 'colour', 'Colour'),
    memory: getField('memory_size', 'MemorySize', 'memorySize', 'memory', 'Memory'),
    ram: getField('ram', 'RAM', 'Ram', 'memory_ram', 'MemoryRAM'),
    first_received: formatDateSafe(getField('date', 'Date', 'first_received', 'FirstReceived')),
    latest_update: String(latestUpdate || ''),
    working: workingStatus,
    battery_health: getField('battery_health', 'BatteryHealth', 'batteryHealth', 'battery', 'Battery'),
    bcc: getField('cycle_count', 'CycleCount', 'cycleCount', 'battery_cycle', 'BatteryCycle'),
    mdm: getField('mdm_lock', 'MDMLock', 'mdmLock', 'mdm', 'MDM'),
    grade: getField('cosmetic', 'Cosmetic', 'grade', 'Grade', 'condition', 'Condition'),
    notes: getField('notes', 'Notes', 'note', 'Note'),
    failed: getField('failed_diagnostics', 'FailedDiagnostics', 'failedDiagnostics', 'failed', 'Failed'),
    tester_name: getField('user', 'User', 'tester', 'Tester', 'tester_name', 'TesterName'),
    repair_notes: getField('parts_message', 'PartsMessage', 'partsMessage', 'repair_notes', 'RepairNotes'),
  };
}
