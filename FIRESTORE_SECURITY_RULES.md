# Firestore Security Rules for Collection Group Queries

## Issue
The console shows "Missing or insufficient permissions" errors because collection group queries require special security rules.

## Solution
Update your Firestore Security Rules to allow collection group queries.

## Steps to Fix

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: `dncl-imei-quickcheck`
   - Go to **Build > Firestore Database**
   - Click on the **Rules** tab

2. **Replace the rules with this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to notes collection (specific path)
    match /notes/{tabName}/imei/{imei} {
      allow read, write: if true;
    }
    
    // Allow collection group queries on 'imei' collections
    // This is required for collectionGroup queries
    match /{path=**}/imei/{imei} {
      allow read, write: if true;
    }
  }
}
```

3. **Click "Publish"** to save the rules

4. **Wait a few seconds** for the rules to propagate

5. **Refresh your web app** and check the console - the errors should be gone

## Explanation

The original rules only allowed:
```javascript
match /notes/{tabName}/imei/{imei}
```

But collection group queries need:
```javascript
match /{path=**}/imei/{imei}
```

The `{path=**}` pattern matches any path that ends with `/imei/{imei}`, which is what collection group queries use.

## Security Note

⚠️ **Current rules allow open read/write access** (for testing). For production, consider:
- Adding authentication
- Restricting access based on user roles
- Using more specific rules

## Verify It Works

After updating the rules:
1. Check browser console - permission errors should be gone
2. You should see: "Loaded X documents from collection group 'imei'"
3. IMEIs should appear in your Firebase search page
