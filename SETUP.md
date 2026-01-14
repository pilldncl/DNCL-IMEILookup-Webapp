# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Phonecheck API Credentials
   PHONECHECK_USERNAME=your_username
   PHONECHECK_PASSWORD=your_password

   # ICE Q API Configuration
   ICEQ_COMPANY=your_company
   ICEQ_VERSION=v2_8_1
   ICEQ_LICENSE=your_license
   ICEQ_BEARER=your_bearer_token
   ```

   **Important**: 
   - Firebase config values should start with `NEXT_PUBLIC_` to be accessible in the browser
   - API credentials (Phonecheck/ICE Q) should NOT have `NEXT_PUBLIC_` prefix as they're only used server-side

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
DNCLImeiLookUpWebApp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main lookup page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── api/               # API routes (server-side)
│   │       ├── phonecheck/    # Phonecheck API proxy
│   │       └── iceq/          # ICE Q API proxy
│   ├── components/            # React components
│   │   ├── LookupTabs.tsx    # Tab navigation
│   │   ├── LookupTab.tsx     # Main lookup tab component
│   │   ├── DeviceDisplay.tsx # Device info display
│   │   ├── NotesSection.tsx  # Notes with Firebase
│   │   └── HistoryButtons.tsx # Search history buttons
│   ├── lib/                  # Utility libraries
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── firestore-notes.ts # Firebase notes functions
│   │   ├── phonecheck.ts     # Phonecheck API utilities
│   │   ├── iceq.ts           # ICE Q API utilities
│   │   └── utils.ts          # Shared utilities
│   └── types/                # TypeScript types
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Features Implemented

✅ **Core Features**
- IMEI/Serial lookup via Phonecheck API
- IMEI/Serial lookup via ICE Q API
- Two-tab interface (Phonecheck / ICE-Q)
- Device information display
- Notes with Firebase Firestore integration
- Barcode generation
- Search history (last 3 searches)
- Raw JSON data viewing

✅ **Firebase Integration**
- Notes storage in Firestore
- Note history tracking
- Multi-station support (via localStorage for station config)
- Auto-save to cloud

## Next Steps

1. **Enhanced Firebase Lookup Features** (To be implemented)
   - Advanced search/filter UI
   - Search by IMEI, Station, Date Range, User
   - Data visualization
   - Export functionality

2. **Settings Page** (To be implemented)
   - Station name configuration
   - User name configuration
   - Location configuration

## Notes

- API credentials are stored server-side for security
- Firebase config is public (as required by Firebase SDK)
- Notes are stored in Firestore collection: `notes/{tabName}/imei/{imei}`
- Search history is stored in localStorage
- Station configuration is stored in localStorage (needs Settings UI)

## Troubleshooting

### Firebase not working
- Check that all Firebase environment variables are set correctly
- Ensure Firestore is enabled in Firebase Console
- Check Firestore security rules allow read/write

### API calls failing
- Verify API credentials in `.env.local`
- Check network tab in browser dev tools for errors
- Ensure API routes are working (check `/api/phonecheck` and `/api/iceq`)

### Barcode not showing
- Ensure `jsbarcode` package is installed
- Check browser console for errors
- Verify IMEI is valid
