import jwt from "jsonwebtoken";

const roleAuthorization = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, "secretkey"); 
      const adminRole = decoded.role;

      if (roles.includes(adminRole)) {
        req.admin = decoded;
        next();
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Access denied" });
      }
    } catch (error) {
      return res.status(401).send({ success: false, message: "Invalid token" });
    }
  };
};

export default roleAuthorization;
