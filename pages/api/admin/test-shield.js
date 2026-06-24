// Route بسيط لاختبار تكامل Royal Shield
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
        message: "Authorization header missing",
        debug: "يجب إرسال Authorization header مع Bearer token"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Token missing",
        debug: "يجب إرسال token بعد Bearer"
      });
    }

    // تسجيل المعلومات للتصحيح
    console.log("🔍 Test Route Debug:");
    console.log("- Full Authorization:", authHeader);
    console.log("- Token (first 20 chars):", token.substring(0, 20) + "...");
    console.log("- Token length:", token.length);

    // إنشاء OTAT بسيط للاختبار
    const testOTAT = "test-otat-" + Date.now();
    const shieldUrl = `https://royalshieldworld.com/admin?otat=${encodeURIComponent(testOTAT)}`;

    return res.status(200).json({
      success: true,
      message: "Test OTAT generated successfully",
      url: shieldUrl,
      tokenInfo: {
        received: true,
        length: token.length,
        prefix: token.substring(0, 20) + "..."
      },
      debug: "Route يعمل بنجاح - يمكن الانتقال للـ Route الحقيقي"
    });

  } catch (err) {
    console.error("Test Route Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message,
      debug: "خطأ في الخادم - تحقق من console logs"
    });
  }
};

