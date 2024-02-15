const User = require('../models/User')
const Token = require('../models/Token')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {cookieAttach,sendVerificationEmail, sendResetPasswordEmail, createHash} = require('../utils')
const createTokenUser = require('../utils/createTokenUser')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

exports.register = async (req, res)=>{
    const {email, name, password} = req.body
    const emailExist = await User.findOne({email})
    if(emailExist){
        throw new CustomError.BadRequestError('Email is already Exist')
    }

    // first registered user is admin
    const isFirst = await User.countDocuments({}) === 0
    const role = isFirst ? 'admin' : 'user'

    //const verificationToken = 'fake token'
    const verificationToken = crypto.randomBytes(40).toString('hex')
    // console.log(verificationToken);
    const user = await User.create({
      name,
      email,
      password,
      role,
      verificationToken
    })
    const origin = 'http://localhost:5000/api/v1'
    await sendVerificationEmail({name:user.name,email:user.email,verificationToken:user.verificationToken,origin})
    //send verification token when testing
    res.status(StatusCodes.CREATED).json({msg:"Succsess! Please Check ur email to verify you account",verificationToken:user.verificationToken})

}

exports.verifyEmail = async(req, res)=>{
  
  const verificationToken = req.query.token;
  const email = req.query.email;
  const user = await User.findOne({email})

  if(!user){
    throw new CustomError.UnauthenticatedError(`Verification Failed`)
  }
  if(user.verificationToken !== verificationToken){
    throw new CustomError.UnauthenticatedError('Verification Failed')
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''

  await user.save()
  res.status(StatusCodes.OK).json({msg:'Email Verified'})
}
 exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    
    if(!user.isVerified){
        throw new CustomError.UnauthenticatedError('Please verify your email')
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    
    const userToken = createTokenUser(user)
    //create refresh token
    let refreshToken = ''
    //check for existing token
    const existingToken = await Token.findOne({userId:user._id})
    // console.log(existingToken);
    if(existingToken){
      const {isValid} = existingToken
      if(!isValid){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
      }
      refreshToken = existingToken.refreshToken
      cookieAttach({ res, user: userToken, refreshToken });
      res.status(StatusCodes.OK).json({ user: userToken });
      return
    }
    refreshToken= crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const refreshTokenDoc = {
        refreshToken,
        userAgent,
        ip,
        userId:user._id
    }
     await Token.create(refreshTokenDoc)

    cookieAttach({ res, user: userToken, refreshToken });
  
    res.status(StatusCodes.OK).json({ user: userToken });
  };

  exports.forgetPassword = async(req,res)=>{
      const {email} = req.body
      if(!email){
        throw new CustomError.BadRequestError('Please provide valid email')
      }

      const user = await User.findOne({email})
      if(user){
        const passwordToken = crypto.randomBytes(40).toString('hex')
        const origin = 'http://localhost:5000/api/v1'

        await sendResetPasswordEmail({
          name: user.name,
          email: user.email,
          token: passwordToken,
          origin,
        });
    
        const tenMinutes = 10*60*1000
        const passwordTokenExpirationDate = new Date(Date.now()) + tenMinutes

        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate=passwordTokenExpirationDate
        await user.save()
      }
      res.status(StatusCodes.OK).json({msg:'Please Check you email for reset password link'})
  }

  exports.resetPassword = async(req,res)=>{
    const {password,token,email } = req.body;
    // const {token,email} = req.query

    if (!token || !email || !password) {
      throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ email });
  
    if (user) {
      const currentDate = new Date();
      console.log(user);
      console.log(createHash(token));
      console.log(currentDate);
      console.log(user.passwordTokenExpirationDate);
      console.log(user.passwordTokenExpirationDate < currentDate);
      console.log(user.passwordToken === createHash(token));
      if (
        user.passwordToken === createHash(token) &&
        user.passwordTokenExpirationDate > currentDate
      ) {
        console.log('hi');
        user.password = password;
        user.passwordToken = null;
        user.passwordTokenExpirationDate = null;
        await user.save();
      }
    }
  
    res.send('reset password');  
  }

exports.logout = async (req, res)=>{
  await Token.findOneAndDelete({userId:req.user.userId}
    )
  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
    res.status(StatusCodes.OK).json({msg:'user logged out'})
}
