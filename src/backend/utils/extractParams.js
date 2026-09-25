/**
 * 
 * @param {string} requestPath - Gelen istek yolu, örneğin "/DeleteRoleById/2"
 * @param {number} paramIndex - Parametrenin hangi sırada olduğunu belirtiyoruz (örneğin, 1. parametre)
 * @returns {string} - Parametre değeri
 */
const extractParam = (requestPath) => {
const segments = requestPath.split('/');
  if (segments.length <= 2) {
    return requestPath;
  }
  segments[segments.length - 1] = ':id';
  return segments.join('/');
};

module.exports = extractParam;