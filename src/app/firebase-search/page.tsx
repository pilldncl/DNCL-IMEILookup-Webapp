'use client';

import Link from 'next/link';
import FirebaseSearch from '@/components/FirebaseSearch';

export default function FirebaseSearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary hover:text-blue-700 font-semibold">
              IMEI Lookup
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-semibold">Firebase Search</span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
          >
            ← Back to Lookup
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <FirebaseSearch />
      </div>
    </main>
  );
}
