const CustomError = require("../errors");

const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authenication Invalid");
  }
};

const authorizePermission =  (...roles) => {
  // if(req.user.role!=='admin'){
  //   throw new CustomError.UnauthorizedError('Unauthorized to Access')
  // }
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("Unauthorized to Access this page");
    }
    // return a callback to express if role not present in array then log an error otherwise go to next call, here it is getAllUser function
    next();
  };
};

module.exports = { authenticateUser, authorizePermission };
