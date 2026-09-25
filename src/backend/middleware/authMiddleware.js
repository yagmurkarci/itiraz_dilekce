const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Authorization: Bearer token

  if (!token) {
    return res.status(403).send({ message: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }

    //console.log("Decoded JWT:", decoded);
    req.user = decoded;
    //req continue
    next();  
  });
};


module.exports = verifyToken;
