const JWT = require('jsonwebtoken')

const createJwt = ({payload}) =>{
    const token = JWT.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
    return token
}

const verifyToken = ({ token }) => JWT.verify(token, process.env.JWT_SECRET);


const cookieAttach = ({res, user}) =>{
    const token = createJwt({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
}



module.exports = {
    createJwt,
    verifyToken,
    cookieAttach
}