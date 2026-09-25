const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const extractParamsFromPath = require('../utils/extractParams')

const dynamicAuthorize = async (req, res, next) => {
  try {
    
    const user = req.user; // user info from jwt
    if (!user || !user.roles) {
      return res.status(403).send({ message: "Yetkisiz erişim" });
    }

    // userrole from jwt's user
    const userRoleIds = user.roles.map(role => role.roleId);

    
    const requestPath = req.path;
    const requestMethod = req.method;
    const requestPathSalt = extractParamsFromPath(requestPath);
    console.log(requestPathSalt)
    // check db for findind endpoint in db
    let endpoint = await prisma.endpoint.findUnique({
      where: {
        endpointPath_method: {
          endpointPath: requestPath,
          method: requestMethod,
        },
      },
      select: { id: true, endpointPath: true },
    });

    if (!endpoint) {
      console.log('here')
      endpoint = await prisma.endpoint.findUnique({
        where: {
          endpointPath_method: {
            endpointPath: requestPathSalt,
            method: requestMethod,
          },
        },
        select: { id: true, endpointPath: true },
      }); 

      if (!endpoint) {
          return res.status(404).send({ message: "Bu endpoint sistemde tanımlı değil!" });
      } 
    }


    // permission check
    const hasPermission = await prisma.endpointRole.findFirst({
      where: {
        endpointId: endpoint.id,
        roleId: { in: userRoleIds }, 
      },
    });

    if (!hasPermission) {
      return res.status(403).send({ message: "Yetkisiz erişim!" });
    }

    // req continue
    next();
  } catch (error) {
    console.error("Yetkilendirme hatası:", error);
    return res.status(500).send({ message: "Yetkilendirme hatası!" });
  }
};

module.exports = dynamicAuthorize;
