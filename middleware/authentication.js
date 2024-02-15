const CustomError = require('../errors')
const {verifyToken} = require('../utils')
const Token = require('../models/Token')
const {cookieAttach} = require('../utils')

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  // console.log("1...",accessToken);
  // console.log(refreshToken);
  try {
    if (accessToken) {
      const payload = verifyToken(accessToken);
      req.user = payload.user
      return next();

    }

    const payload = verifyToken(refreshToken);
    // console.log(payload);
    const existingToken = await Token.findOne({
      userId: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    console.log(existingToken);
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid...1');
    }

    cookieAttach({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    // console.log(error.stack);
    throw new CustomError.UnauthenticatedError('Authentication Invalid...11');
  }
  }


  const authorizePermissions = (...roles)=>{
      return(req, res, next)=>{
        if(!roles.includes(req.user.role)){
          throw new CustomError.UnauthorizedError('Un Authorized to access this route');
        }
        next()
      }
  }
module.exports = {authenticateUser, authorizePermissions}