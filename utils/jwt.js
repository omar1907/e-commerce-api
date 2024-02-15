const JWT = require('jsonwebtoken')

const createJwt = ({payload}) =>{
    const token = JWT.sign(payload,process.env.JWT_SECRET)
    return token
}

const verifyToken = ( token ) => JWT.verify(token, process.env.JWT_SECRET);


const cookieAttach = ({res, user, refreshToken}) =>{
  const accessTokenJwt = createJwt({ payload: {user} });
  const refreshTokenJwt = createJwt({ payload: {user, refreshToken} });

  const oneDay = 1000 * 60 * 60 * 24;
  const longExp = 1000 * 60 * 60 * 24 * 30;
  
  res.cookie('accessToken', accessTokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay )
  });

  res.cookie('refreshToken', refreshTokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longExp )
  });
}

// const singleCookieAttach = ({res, user}) =>{
//   const token = createJwt({ payload: user });

// const oneDay = 1000 * 60 * 60 * 24;
// const fiveSeconds = 1000* 5
// res.cookie('token', token, {
//   httpOnly: true,
//   expires: new Date(Date.now() + fiveSeconds ),
//   secure: process.env.NODE_ENV === 'production',
//   signed: true,
// });
// }



module.exports = {
    createJwt,
    verifyToken,
    cookieAttach
}