# Environment Variables Setup

## Create `.env.local` file

Create a file named `.env.local` in the root directory of this project with the following content:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCimNF8HzXeccZiiC_P03T02ZvXWs9K-Ww
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dncl-imei-quickcheck.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dncl-imei-quickcheck
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dncl-imei-quickcheck.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=11162145609
NEXT_PUBLIC_FIREBASE_APP_ID=1:11162145609:web:efe4bc830dc691bd3a4098

# Phonecheck API Credentials
PHONECHECK_USERNAME=dncltechzoneinc
PHONECHECK_PASSWORD=@Ustvmos817

# ICE Q API Configuration
ICEQ_COMPANY=ice140
ICEQ_VERSION=v2_8_1
ICEQ_LICENSE=ICE140-35484534-664846546
ICEQ_BEARER=293KW992HPQQ8V481M221HS6Q44LXX882
```

## Instructions

1. Create a new file in the root directory named `.env.local`
2. Copy the content above into the file
3. Save the file
4. Restart your development server (`npm run dev`)

**Note:** The `.env.local` file is already in `.gitignore`, so your credentials won't be committed to git.

## Verification

After creating the file, restart your dev server and check:
- Browser console should show "Firebase db is initialized"
- The Firebase search page should load data from Firestore
- IMEI lookup should work with Phonecheck and ICE Q APIs
