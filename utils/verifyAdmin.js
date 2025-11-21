 const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "failed",
      message: "Access denied. Only admin users are allowed.",
    });
  }
};

export default verifyAdmin;