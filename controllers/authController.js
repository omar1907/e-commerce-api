const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {cookieAttach} = require('../utils')
const createTokenUser = require('../utils/createTokenUser')

exports.register = async (req, res)=>{
    const {email, name, password} = req.body
    const emailExist = await User.findOne({email})
    if(emailExist){
        throw new CustomError.BadRequestError('Email is already Exist')
    }

    // first registered user is admin
    const isFirst = await User.countDocuments({}) === 0
    const role = isFirst ? 'admin' : 'user'
    const user = await User.create({name, email, password, role})

    const userToken = createTokenUser(user)
    cookieAttach({res, user:userToken})
    res.status(StatusCodes.CREATED).json({user});

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
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const userToken = createTokenUser(user)
    cookieAttach({ res, user: userToken });
  
    res.status(StatusCodes.OK).json({ user: userToken });
  };



exports.logout = async (req, res)=>{
    res.cookie('token','logout',{
        httpOnle:true,
        expires:new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg:'user logged out'})
}
