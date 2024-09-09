// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     const authHeader = req.header('Authorization');
//     console.log("Auth Header:", authHeader); 
//     const token = authHeader && authHeader.split(' ')[1];
//     console.log("Extracted token:", token); 

//   if (!token) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded token:", decoded);
//     req.user = decoded.userId;
//     console.log("Decoded user:", req.user)
//     next();
//   } catch (error) {
//     console.error("Token verification error:", error);
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user:", decoded.userId);
    req.userId = decoded.userId; 
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};