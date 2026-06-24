// Route بسيط لاختبار OTAT بدون Firebase Admin SDK
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "GET only" });
  }

  try {
    // التحقق من الـ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization header missing" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Token missing" 
      });
    }

    console.log("🔑 Received token:", token.substring(0, 20) + "...");

    // للاختبار: قبول أي token وإنشاء OTAT
    // في التطبيق الحقيقي، ستحتاج للتحقق من Token
    
    // توليد توكن مؤقت (60 ثانية)
    const otat = jwt.sign(
      {
        id: "admin-id",
        username: "admin",
        email: "admin@royalnano.com",
        purpose: "shield_access",
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: "60s" }
    );

    const shieldUrl = `https://royalshieldworld.com/admin?otat=${encodeURIComponent(otat)}`;

    console.log("🎯 Generated OTAT successfully");
    console.log("🔗 Shield URL:", shieldUrl);

    return res.status(200).json({
      success: true,
      message: "OTAT generated successfully (simple version)",
      url: shieldUrl,
      expiresIn: 60,
      tokenInfo: {
        received: true,
        length: token.length,
        prefix: token.substring(0, 20) + "..."
      }
    });

  } catch (err) {
    console.error("Simple Shield Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};














