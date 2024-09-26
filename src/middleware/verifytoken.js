import jwt from "jsonwebtoken";

const verifytoken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(400).send({ success:false, message: "Authorization header is missing" });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(400).send({success:false, message: "Invalid token" });
  }
  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success:false, message: "Invalid token" });
  }
};
export default verifytoken;