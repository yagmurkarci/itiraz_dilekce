const authorize = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).send({ message: "Yetkisiz erişimss" });
      }
  
      // Kullanıcının rollerini dizi olarak kontrol et
      const userRoles = req.user.roles.map(role => role.roleName);
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
  
      if (!hasPermission) {
        return res.status(403).send({ message: "Yetkisiz erişimsd" });
      }
  
      next();
    };
  };
  
  module.exports = authorize;