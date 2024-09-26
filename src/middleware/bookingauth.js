import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Token missing",
    });
  }

  // Verify the token using your secret
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) {
      return res.status(403).send({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};

export default authenticateJWT;