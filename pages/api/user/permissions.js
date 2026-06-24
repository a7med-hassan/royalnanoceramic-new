/**
 * API Route: Get User Permissions
 * GET /api/user/permissions
 * 
 * This endpoint retrieves the permissions for the authenticated user
 * based on their Firebase authentication token.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
  }
}

const db = admin.firestore();

/**
 * GET /api/user/permissions
 * Input: Firebase Token in Authorization header
 * Output: User permissions object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1]; // Extract Bearer token
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    console.log('🔐 Verifying Firebase token...');

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log('✅ Token verified for user:', userId);

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.error('❌ User not found in Firestore:', userId);
      return res.status(404).json({ 
        success: false,
        message: 'User not found in database' 
      });
    }

    const userData = userDoc.data();

    // Check if user is deleted
    if (userData.deleted) {
      return res.status(403).json({ 
        success: false,
        message: 'User account is disabled' 
      });
    }

    // Return user permissions
    console.log('✅ Returning permissions for user:', userId);
    
    return res.status(200).json({
      success: true,
      permissions: userData.permissions || {},
      role: userData.role || 'user',
      userId: userId,
      userName: userData.name || '',
      userEmail: userData.email || ''
    });

  } catch (error) {
    console.error('❌ Error in /api/user/permissions:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    // Generic error response
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
}



