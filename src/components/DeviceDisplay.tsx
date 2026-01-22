'use client';

import { useEffect, useRef } from 'react';
import { DeviceData, ApiType } from '@/types';
import { generateSKU } from '@/lib/utils';
import JsBarcode from 'jsbarcode';

interface DeviceDisplayProps {
  data: DeviceData;
  apiType: ApiType;
  rawVisible: boolean;
  onToggleRaw: () => void;
}

export default function DeviceDisplay({ data, apiType, rawVisible, onToggleRaw }: DeviceDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data.imei && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.imei, {
          format: "CODE128",
          width: 2.5,
          height: 40,
          displayValue: false,
          margin: 8,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (error) {
        console.error('Barcode generation failed:', error);
      }
    }
  }, [data.imei]);

  // Get working status
  let originalRaw: any;
  if (apiType === 'iceq' && Array.isArray(data._rawData) && data._rawData.length > 0) {
    originalRaw = data._rawData[data._rawData.length - 1];
  } else {
    originalRaw = Array.isArray(data._rawData) ? data._rawData[0] : data._rawData;
  }

  let workingStatusFromAPI = '';
  if (apiType === 'iceq') {
    workingStatusFromAPI = String(originalRaw?.device_functionality || originalRaw?.testing_finished || '');
  } else {
    workingStatusFromAPI = String(originalRaw?.Working || '');
  }

  const workingStatusLower = workingStatusFromAPI.toLowerCase();
  let workingStatus = '';
  let workingClass = '';
  
  if (workingStatusLower === 'yes' || workingStatusLower === 'pass' || workingStatusLower === 'pass*') {
    workingStatus = 'PASS';
    workingClass = 'bg-green-500 text-white px-3.5 py-1 rounded-md font-bold text-lg tracking-wide';
  } else if (workingStatusLower === 'no' || workingStatusLower === 'fail' || workingStatusLower === 'fail*') {
    workingStatus = 'FAILED';
    workingClass = 'bg-red-100 text-red-800 px-3.5 py-1 rounded-md font-bold text-lg tracking-wide';
  } else if (workingStatusLower === 'pending' || workingStatusLower === 'incomplete' || workingStatusLower === 'incomplete*') {
    workingStatus = 'PENDING';
    workingClass = 'bg-yellow-100 text-yellow-800 px-3.5 py-1 rounded-md font-bold text-lg tracking-wide';
  } else {
    workingStatus = workingStatusFromAPI || data.working || '';
    workingClass = '';
  }

  const sku = generateSKU(data, apiType);
  
  let carrierDisplay = data.carrier || 'N/A';
  if (apiType === 'iceq' && data.sim_lock && data.sim_lock !== 'N/A') {
    const simLock = String(data.sim_lock).trim().toUpperCase();
    carrierDisplay = carrierDisplay !== 'N/A' ? `${carrierDisplay} (${simLock})` : simLock;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
      <div className="text-xs text-gray-600 mb-1">Source: {apiType === 'iceq' ? 'ICE Q' : 'Phonecheck'}</div>
      <div className="text-xl font-bold text-center mb-3 tracking-wide">{data.title || ''}</div>
      {sku && <div className="text-lg font-normal italic text-center mb-4 text-gray-600">{sku}</div>}
      
      <div className="flex flex-row gap-5 mb-4">
        {/* ABOUT PHONE Column */}
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-primary mb-2 tracking-wide">ABOUT PHONE</div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Model #:</span>
            <b className="text-left max-w-[250px] break-words">{data.model}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">IMEI #:</span>
            <b className="text-left max-w-[250px] break-words">{data.imei}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Serial #:</span>
            <b className="text-left max-w-[250px] break-words">{data.serial}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Carrier:</span>
            <b className="text-left max-w-[250px] break-words">{carrierDisplay}</b>
          </div>
          {apiType === 'iceq' && (
            <div className="flex justify-between mb-1.5 text-base">
              <span className="text-gray-700 mr-3 flex-shrink-0">SIM Lock:</span>
              <b className="text-left max-w-[250px] break-words">{data.sim_lock || 'N/A'}</b>
            </div>
          )}
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Color:</span>
            <b className="text-left max-w-[250px] break-words">{data.color}</b>
          </div>
          {data.ram && (
            <div className="flex justify-between mb-1.5 text-base">
              <span className="text-gray-700 mr-3 flex-shrink-0">RAM:</span>
              <b className="text-left max-w-[250px] break-words">{data.ram}</b>
            </div>
          )}
          {data.tester_name && (
            <div className="flex justify-between mb-1.5 text-base">
              <span className="text-gray-700 mr-3 flex-shrink-0">Tester:</span>
              <b className="text-left max-w-[250px] break-words">{data.tester_name}</b>
            </div>
          )}
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">First Received:</span>
            <b className="text-left max-w-[250px] break-words">{data.first_received}</b>
          </div>
        </div>

        {/* HEALTH STATUS Column */}
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-primary mb-2 tracking-wide">HEALTH STATUS</div>
          <div className="flex justify-between mb-1.5 text-base items-start">
            <span className="text-gray-700 mr-3 flex-shrink-0">Working Status:</span>
            <span className={workingClass || 'font-bold'}>{workingStatus}</span>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Battery:</span>
            <b className="text-left max-w-[250px] break-words">{data.battery_health}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">BCC:</span>
            <b className="text-left max-w-[250px] break-words">{data.bcc}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">MDM:</span>
            <b className="text-left max-w-[250px] break-words">{data.mdm}</b>
          </div>
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Grade:</span>
            <b className="text-left max-w-[250px] break-words">{data.grade}</b>
          </div>
          {apiType === 'phonecheck' && (
            <div className="flex justify-between mb-1.5 text-base">
              <span className="text-gray-700 mr-3 flex-shrink-0">Finance Type:</span>
              <b className="text-left max-w-[250px] break-words">
                {data.finance_type && data.finance_type.toLowerCase() === 'loan' ? 'Loan' : 'N/A'}
              </b>
            </div>
          )}
          <div className="flex justify-between mb-1.5 text-base">
            <span className="text-gray-700 mr-3 flex-shrink-0">Last Update:</span>
            <b className="text-left max-w-[250px] break-words">{data.latest_update}</b>
          </div>
        </div>
      </div>

      {/* Barcode */}
      {data.imei && (
        <div className="mt-3.5 text-center">
          <div className="text-lg font-semibold mb-2 tracking-wide">IMEI Barcode</div>
          <div className="flex justify-center">
            <svg ref={barcodeRef} className="max-w-full h-10"></svg>
          </div>
          {!barcodeRef.current?.hasChildNodes() && (
            <div className="text-base mt-2">{data.imei}</div>
          )}
        </div>
      )}

      {/* Notes and Failed */}
      {(data.notes || data.failed) && (
        <div className="flex gap-4 mt-4">
          {data.notes && (
            <div className="flex-1 bg-gray-100 rounded p-2">
              <div className="text-sm whitespace-pre-wrap break-words">{data.notes}</div>
            </div>
          )}
          {data.failed && (
            <div className="flex-1 bg-gray-100 rounded p-2">
              <div className="text-sm break-words"><b>Failed:</b> {data.failed}</div>
            </div>
          )}
        </div>
      )}

      {/* Repair Notes */}
      {data.repair_notes && (
        <div className="mt-4">
          <div className="text-base font-bold text-primary mb-1 tracking-wide">REPAIR NOTES</div>
          <div className="bg-gray-100 rounded p-2 text-sm whitespace-pre-wrap break-words">
            {data.repair_notes}
          </div>
        </div>
      )}

      {/* Raw Data Toggle */}
      <div className="mt-4 text-right">
        <button
          onClick={onToggleRaw}
          className="text-sm text-primary underline cursor-pointer"
        >
          {rawVisible ? 'Hide Raw Data' : 'Show Raw Data'}
        </button>
      </div>

      {/* Raw Data Display */}
      {rawVisible && data._rawData && (
        <pre className="bg-gray-100 p-3 rounded text-xs max-h-96 overflow-auto border border-gray-200 mt-2 whitespace-pre-wrap break-words font-mono">
          {JSON.stringify(data._rawData, null, 2)}
        </pre>
      )}
    </div>
  );
}
