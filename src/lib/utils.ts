import { DeviceData, ApiType } from '@/types';

/**
 * Detect if input is IMEI (digits only) or Serial (alphanumeric)
 */
export function detectInputType(input: string): 'imei' | 'serial' | null {
  if (/^\d{8,15}$/.test(input)) return 'imei';
  if (/^[A-Za-z0-9]{8,15}$/.test(input)) return 'serial';
  return null;
}

/**
 * Generate SKU string from device data
 */
export function generateSKU(data: DeviceData, apiSource: ApiType): string {
  const model = String(data.model_name || '').trim();
  const memory = String(data.memory || '').trim();
  const ram = String(data.ram || '').trim();
  const color = String(data.color || '').trim();
  let carrier = String(data.carrier || '').trim();
  
  // For ICE-Q, append SIM lock status to carrier
  if (apiSource === 'iceq' && data.sim_lock) {
    const simLock = String(data.sim_lock).trim();
    if (simLock && simLock !== 'N/A') {
      const lockStatus = simLock.toUpperCase();
      carrier = carrier ? `${carrier} (${lockStatus})` : lockStatus;
    }
  }
  
  const skuParts = [model, memory, ram, color, carrier].filter(part => part !== '');
  return skuParts.join(' - ');
}

/**
 * Format date string
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  } catch (e) {
    return String(dateStr);
  }
}
