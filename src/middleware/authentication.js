// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/users.js";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res
      .status(401)
      .json({ success: false, message: "Token is required" });

  jwt.verify(token,"secretkey", async (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "Forbidden" });

    const dbUser = await User.findByPk(user.id);
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    req.user = dbUser;
    next();
  });
};

export default authenticateToken;