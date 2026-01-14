# DNCL IMEI Lookup Web App

Web application for IMEI/Serial device lookups using Phonecheck API and ICE Q API, with enhanced Firebase data lookup capabilities.

## Features

### Core Features
- IMEI/Serial lookup via Phonecheck API
- IMEI/Serial lookup via ICE Q API
- Device information display
- Notes with Firebase Firestore integration
- Barcode generation
- Search history
- Settings management

### Enhanced Firebase Features
- Advanced search and filtering
- Search by IMEI, Station, Date Range, User
- Data visualization and statistics
- Export functionality

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

PHONECHECK_USERNAME=your_phonecheck_username
PHONECHECK_PASSWORD=your_phonecheck_password

ICEQ_COMPANY=your_iceq_company
ICEQ_VERSION=v2_8_1
ICEQ_LICENSE=your_iceq_license
ICEQ_BEARER=your_iceq_bearer
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Technology Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Firebase Firestore
- Tailwind CSS
- JsBarcode
