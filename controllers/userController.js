const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomeError = require('../errors')
const createTokenUser = require('../utils/createTokenUser')
const {cookieAttach} = require('../utils/jwt')
const checkPermission = require('../utils/checkPermission')


exports.getAllUsers =async (req, res)=>{
    // console.log(req.user);
    const users = await User.find({role:'user'}).select('-password')
    res.status(StatusCodes.OK).json({users})
    // console.log(users);
}  

exports.getSingleUser =async (req, res)=>{
    const user = await User.findOne({_id:req.params.id}).select('-password')
    // console.log(user);
    if(!user){
        throw new CustomeError.NotFoundError(`No user with id : ${req.params.id}`)
    }
    checkPermission(req.user, user._id)
    res.status(StatusCodes.OK).json({user})
    // console.log(users);
}  

exports.showCurrentUser =async (req, res)=>{
    res.status(StatusCodes.OK).json({user:req.user})
}  

//update user with findOneAndUpdate
// exports.updateUser =async (req, res)=>{
//     const {email, name} = req.body
//     if(!email || !name){
//         throw new CustomeError.BadRequestError('please provide email or name')
//     }
//     const user = await User.findOneAndUpdate({_id:req.user.userId},{email,name},
//         {new:true,
//         runValidators:true})
//     const userToken = createTokenUser(user)
//     cookieAttach({res,user:userToken})
//     res.status(StatusCodes.OK).json({user:userToken})

// } 


exports.updateUser =async (req, res)=>{
    const {email, name} = req.body
    if(!email || !name){
        throw new CustomeError.BadRequestError('please provide email or name')
    }
    const user = await User.findOne({_id:req.user.userId})
    user.email = email
    user.name = name
    await user.save()
    const userToken = createTokenUser(user)
    cookieAttach({res,user:userToken})
    res.status(StatusCodes.OK).json({user:userToken})

} 


exports.updateUserPassword =async (req, res)=>{
    const {oldPassword, newPassword} = req.body
    if(!oldPassword || !newPassword){
        throw new CustomeError.BadRequestError('please provide both passwords')
    }
    const user = await User.findOne({_id:req.user.userId})
    if(!user){
        throw new CustomeError.UnauthenticatedError('Invalid credentials')

    }
    const match = await user.comparePassword(oldPassword)
    if(!match){
        throw new CustomeError.UnauthenticatedError('Invalid credentials')
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({success:'Password Updated!'})
} 
