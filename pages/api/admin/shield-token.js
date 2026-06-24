const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    console.log("🔥 Initializing Firebase Admin...");
    
    // Method 1: Try service account from environment variable (Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log("📦 Using service account from environment variable");
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase Admin initialized with ENV service account");
    } 
    // Method 2: Try service account key file (Local development)
    else {
      console.log("📦 Using service account from file");
      const serviceAccount = require("../../serviceAccountKey.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase Admin initialized with service account key file");
    }
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log("⚠️ Falling back to application default credentials");
    
    // Fallback to application default credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log("✅ Firebase Admin initialized with application default");
  }
} else {
  console.log("✅ Firebase Admin already initialized");
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

module.exports = async function handler(req, res) {
  console.log("\n" + "=".repeat(60));
  console.log("🛡️ Shield Token API - New Request");
  console.log("=".repeat(60));
  console.log("📍 Method:", req.method);
  console.log("📍 URL:", req.url);
  console.log("📍 Headers:", JSON.stringify(req.headers, null, 2));
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type"
  );

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request handled");
    res.setHeader('Content-Length', '0');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    console.log(`❌ Method ${req.method} not allowed`);
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed. Use GET." 
    });
  }

  try {
    console.log("\n🔐 Step 1: Extracting Authorization header...");
    
    // التحقق من الـ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("❌ Authorization header missing");
      console.log("📋 Available headers:", Object.keys(req.headers));
      return res.status(401).json({ 
        success: false, 
        message: "Authorization header missing" 
      });
    }

    console.log("✅ Authorization header found");

    // Extract token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("❌ Invalid Authorization format. Expected: Bearer <token>");
      console.log("📋 Received:", authHeader.substring(0, 50));
      return res.status(401).json({ 
        success: false, 
        message: "Invalid Authorization format. Use: Bearer <token>" 
      });
    }

    const firebaseToken = parts[1];
    if (!firebaseToken) {
      console.log("❌ Firebase token is empty");
      return res.status(401).json({ 
        success: false, 
        message: "Firebase token is empty" 
      });
    }

    console.log("✅ Firebase token extracted");
    console.log("🔑 Token preview:", firebaseToken.substring(0, 30) + "...");

    // Verify Firebase Auth token
    console.log("\n🔐 Step 2: Verifying Firebase token...");
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      console.log("✅ Firebase token verified successfully");
      console.log("👤 User UID:", decodedToken.uid);
      console.log("📧 User email:", decodedToken.email);
      console.log("📅 Token issued at:", new Date(decodedToken.iat * 1000).toISOString());
      console.log("⏰ Token expires at:", new Date(decodedToken.exp * 1000).toISOString());
    } catch (error) {
      console.error("❌ Firebase token verification failed");
      console.error("💥 Error:", error.message);
      console.error("📋 Error code:", error.code);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired Firebase token",
        error: error.message 
      });
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    
    console.log("\n📊 Step 3: Fetching user data from Firestore...");
    
    // Get user from Firestore to check permissions
    let userData;
    try {
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        console.warn("⚠️ User not found in Firestore, creating basic user object");
        // Create basic user object if not in Firestore
        userData = {
          uid: uid,
          email: email,
          name: email.split('@')[0],
          permissions: {
            royal_shield: { access: false }
          }
        };
      } else {
        userData = userDoc.data();
        console.log("✅ User found in Firestore");
        console.log("👤 User name:", userData.name);
        console.log("🔑 User role:", userData.role);
        console.log("🛡️ Shield permissions:", userData.permissions?.royal_shield);
      }
    } catch (firestoreError) {
      console.error("⚠️ Firestore error:", firestoreError.message);
      // Continue with basic user object
      userData = {
        uid: uid,
        email: email,
        name: email.split('@')[0]
      };
    }

    // Check Royal Shield access permission
    console.log("\n🔐 Step 4: Checking Royal Shield permissions...");
    const hasShieldAccess = userData.permissions?.royal_shield?.access === true;
    
    if (!hasShieldAccess) {
      console.warn("❌ User does not have royal_shield.access permission");
      console.log("📋 User permissions:", JSON.stringify(userData.permissions, null, 2));
      return res.status(403).json({
        success: false,
        message: "Access denied. User does not have royal_shield.access permission",
        permissions: userData.permissions
      });
    }
    
    console.log("✅ User has royal_shield.access permission");
    
    // Create admin user object
    const adminUser = {
      _id: uid,
      username: userData.name || email.split('@')[0],
      email: email,
      firebaseUid: uid,
      role: userData.role || 'user'
    };

    console.log("✅ Admin user object created:", adminUser.username);

    // توليد OTAT (60 ثانية)
    console.log("\n🔧 Step 5: Generating OTAT...");
    const otat = jwt.sign(
      {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        firebaseUid: uid,
        role: adminUser.role,
        purpose: "shield_access",
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: "60s" }
    );

    console.log("✅ OTAT generated successfully");
    console.log("🔑 OTAT preview:", otat.substring(0, 30) + "...");

    // بناء Shield URL
    const shieldUrl = `https://royalshieldworld.com/admin?otat=${encodeURIComponent(otat)}`;
    console.log("🔗 Shield URL:", shieldUrl);

    // النجاح!
    console.log("\n✅ SUCCESS - Sending response to client");
    console.log("=".repeat(60) + "\n");

    return res.status(200).json({
      success: true,
      message: "OTAT generated successfully",
      url: shieldUrl,
      otat: otat,
      expiresIn: 60,
      adminInfo: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (err) {
    console.error("\n💥 CRITICAL ERROR:");
    console.error("❌ Error type:", err.constructor.name);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    console.log("=".repeat(60) + "\n");
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: err.message 
    });
  }
};
