function authorizeToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }
  console.log("req.token",token);
  
  // Place for JWT verification if needed
  // const decoded = jwt.verify(token, secret)

  req.token = token;
  next();
}

module.exports = authorizeToken;