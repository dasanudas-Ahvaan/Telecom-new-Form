import jwt from 'jsonwebtoken';

const verifyRegistrationToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No registration token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email;
    req.mobile = decoded.mobile;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired registration session' });
  }
};

export default verifyRegistrationToken;