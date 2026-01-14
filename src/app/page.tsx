'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LookupTabs from '@/components/LookupTabs';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="DNCL Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <h1 className="text-3xl font-semibold text-gray-800">
                IMEI Lookup
              </h1>
            </div>
            <Link
              href="/firebase-search"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🔍 Firebase Search
            </Link>
          </div>
          <LookupTabs />
        </div>
      </div>
    </main>
  );
}
