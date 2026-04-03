const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = user;
      return next(); // ✅ MUST return
    }

    return res.status(401).json({ error: "Not authorized, no token" });

  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};

module.exports = { protect };