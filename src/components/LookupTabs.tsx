'use client';

import { useState } from 'react';
import LookupTab from './LookupTab';
import { ApiType } from '@/types';

export default function LookupTabs() {
  const [activeTab, setActiveTab] = useState<ApiType>('phonecheck');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-5 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('phonecheck')}
          className={`flex-1 py-3 px-5 font-semibold text-base transition-all ${
            activeTab === 'phonecheck'
              ? 'text-primary border-b-3 border-primary'
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
        >
          Phonecheck
        </button>
        <button
          onClick={() => setActiveTab('iceq')}
          className={`flex-1 py-3 px-5 font-semibold text-base transition-all ${
            activeTab === 'iceq'
              ? 'text-primary border-b-3 border-primary'
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
        >
          ICE-Q
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'phonecheck' && (
          <LookupTab apiType="phonecheck" key="phonecheck" />
        )}
        {activeTab === 'iceq' && (
          <LookupTab apiType="iceq" key="iceq" />
        )}
      </div>
    </div>
  );
}
