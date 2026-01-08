const admin = require('firebase-admin');

// Initialize Firebase with real credentials
try {
  console.log('🔥 Initializing real Firebase Firestore database');
  
  // Check if all required environment variables are set and not placeholder values
  if (!process.env.FIREBASE_PRIVATE_KEY || 
      process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key_Here') ||
      process.env.FIREBASE_PRIVATE_KEY_ID === 'Your_Private_Key_ID_Here' ||
      process.env.FIREBASE_CLIENT_EMAIL.includes('xxxxx')) {
    throw new Error('Firebase credentials not properly configured');
  }
  
  // Production Firebase implementation
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  // Initialize the app if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();

  module.exports = {
    db,
    isMock: false
  };
} catch (error) {
  console.error('❌ Firebase initialization failed. Credentials not properly configured.');
  console.error('📝 To use real Firebase data, please update your .env file with actual Firebase service account credentials.');
  console.error('📋 Steps to configure Firebase:');
  console.error('   1. Go to https://console.firebase.google.com/project/studentresult-348cf/settings/serviceaccounts/adminsdk');
  console.error('   2. Click "Generate New Private Key"');
  console.error('   3. Replace the placeholder values in backend/.env with actual values from the downloaded file');
  console.error('   4. Restart the server');
  console.error('\n⚠️  For development without Firebase, you will need to set up actual data in your Firestore database');
  throw new Error('Firebase configuration error - please follow setup instructions above');
}