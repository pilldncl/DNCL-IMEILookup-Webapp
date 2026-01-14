// Device information types
export interface DeviceData {
  title: string;
  model: string;
  model_name: string;
  imei: string;
  serial: string;
  carrier: string;
  sim_lock: string;
  color: string;
  memory: string;
  ram: string;
  first_received: string;
  latest_update: string;
  working: string;
  battery_health: string;
  bcc: string;
  mdm: string;
  grade: string;
  notes: string;
  failed: string;
  tester_name: string;
  repair_notes: string;
  _rawData?: any;
}

export interface ImeiHistoryItem {
  imei: string;
  model: string;
  memory: string;
  carrier: string;
  status: 'pass' | 'fail' | 'pending' | '';
}

export interface StationConfig {
  stationName: string;
  userName: string;
  location: string;
}

export interface NoteHistoryEntry {
  note: string;
  date: string;
  station: string;
  timestamp: any;
  isCurrent?: boolean;
}

export interface NoteData {
  currentNote: string;
  updatedDate: string;
  station: string;
  userName: string;
  location: string;
  updatedAt: any;
  history: NoteHistoryEntry[];
}

export type ApiType = 'phonecheck' | 'iceq';
