# Firebase Admin SDK Setup Guide

## 🚀 Quick Setup for Real Firebase Data

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studentresult-348cf`
3. Go to **Project Settings** (⚙️ icon)
4. Click on **Service accounts** tab
5. Click **"Generate new private key"**
6. Save the JSON file to your computer

### Step 2: Update Backend .env File

Open `backend/.env` and update these values with your service account JSON:

```bash
# Firebase Admin SDK Configuration (Backend)
FIREBASE_PROJECT_ID=studentresult-348cf
FIREBASE_PRIVATE_KEY_ID=your_actual_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_actual_service_account_email@studentresult-348cf.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_actual_client_id_here
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/YOUR_SERVICE_ACCOUNT%40studentresult-348cf.iam.gserviceaccount.com
```

### Step 3: Required Firestore Collections

Create these collections in your Firestore database:

#### `students` Collection
Document fields:
- `id` (string) - Student registration number
- `name` (string) - Student name
- `dob` (string) - Date of birth (YYYY-MM-DD format)
- `regNo` (string) - Registration number (same as id)
- `year` (string) - Academic year (e.g., "Year I", "Year II")
- `dept` (string) - Department (e.g., "cse")
- `email` (string) - Student email
- `createdAt` (timestamp) - Creation timestamp

#### `grades` Collection
Document fields:
- `id` (string) - Unique grade document ID (e.g., "731623102036_Year I_Sem 1")
- `studentId` (string) - Student registration number
- `year` (string) - Academic year
- `semester` (string) - Semester (e.g., "Sem 1", "Sem 2")
- `subjects` (array) - Array of subject objects:
  ```json
  [
    {
      "name": "tamil",
      "marks": 55,
      "grade": "B",
      "present": true
    }
  ]
  ```

### Step 4: Test the API

Start your backend server:
```bash
cd backend
npm start
```

Test the grade validation endpoint:
```bash
curl -X POST http://localhost:5000/api/students/validate-grade-access \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "731623102036",
    "dob": "2026-01-05",
    "year": "Year I",
    "semester": "Sem 1"
  }'
```

### 🔍 Troubleshooting

**Error: "Firebase Admin SDK credentials required"**
- Make sure you've updated all Firebase environment variables in `backend/.env`
- Ensure the private key is properly formatted with \n for line breaks

**Error: "No grades found for student"**
- Verify the student exists in the `students` collection
- Check that grades exist in the `grades` collection with matching studentId, year, and semester
- Ensure field names match exactly (case-sensitive)

**Permission Denied Errors**
- Make sure Firestore rules allow read/write access
- Check that your service account has Firestore permissions

### 📝 Sample Data Structure

**Student Document:**
```json
{
  "id": "731623102036",
  "name": "kesa",
  "dob": "2026-01-05",
  "regNo": "731623102036",
  "year": "Year I",
  "dept": "cse",
  "email": "kesa@example.com",
  "createdAt": "2026-01-07T10:28:25.907Z"
}
```

**Grade Document:**
```json
{
  "id": "731623102036_Year I_Sem 1",
  "studentId": "731623102036",
  "year": "Year I",
  "semester": "Sem 1",
  "subjects": [
    {
      "name": "tamil",
      "marks": 55,
      "grade": "B",
      "present": true
    },
    {
      "name": "english",
      "marks": 77,
      "grade": "A",
      "present": true
    }
  ]
}
```

## 🎯 Available API Endpoints

### Grade Validation (Strict - All fields required)
- `POST /api/students/validate-grade-access`
  ```json
  {
    "regNo": "731623102036",
    "dob": "2026-01-05",
    "year": "Year I",
    "semester": "Sem 1"
  }
  ```

### Flexible Verification (Optional year/semester)
- `POST /api/students/verify`
  ```json
  {
    "regNo": "731623102036",
    "dob": "2026-01-05",
    "year": "Year I",
    "semester": "Sem 1"
  }
  ```

Now your system will use real Firebase Firestore data instead of mock data! 🎉
