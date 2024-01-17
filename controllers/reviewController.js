const {StatusCodes} = require('http-status-codes')
const CustomeError = require('../errors')
const Product = require('../models/Product')
const Review = require('../models/Review')
const checkPermission = require('../utils/checkPermission')

exports.createReview = async(req, res) =>{
    const {product:productId} = req.body
    const isValidProduct = await Product.findOne({_id:productId})
    if(!isValidProduct){
        throw new CustomeError.NotFoundError(`no product found with id : ${productId}`)
    }

    const alreadyReview = await Review.findOne({product:productId,user:req.user.userId})

    if(alreadyReview){
        throw new CustomeError.BadRequestError('Already Submitted reveiw for this product')
    }

    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({Review: review})
}

exports.getAllReviews = async(req, res) =>{
    const reviews = await Review.find({})
    .populate({path:'product', select:'name company price -_id'})
    .populate({path:'user', select:'name -_id'})
    res.status(StatusCodes.OK).json({Reviews: reviews, count:reviews.length})
}

exports.getSingleReview = async (req, res) =>{
    const {id:reviewId} = req.params
    const review = await Review.findOne({_id:reviewId})
    if(!review){
        throw new CustomeError.NotFoundError(`no review found with id : ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({Reviews: review})
    
}

exports.updateReview = async (req, res) =>{
    const {id:reviewId} = req.params
    const {rating, title, comment} = req.body
    const review = await Review.findOne({_id:reviewId})

    if(!review){
        throw new CustomeError.NotFoundError(`no review found with id : ${reviewId}`)
    }

    checkPermission(req.user, review.yser)

    review.rating = rating
    review.title = title
    review.comment = comment
    
    await review.save()

    res.status(StatusCodes.OK).json({review})

}

exports.deleteReview = async (req, res) =>{
    const {id:reviewId} = req.params

    const review = await Review.findOne({_id:reviewId})

    if(!review){
        throw new CustomeError.NotFoundError(`no review found with id : ${reviewId}`)
    }

    checkPermission(req.user,review.user)
    await review.remove()
    res.status(StatusCodes.OK).json({msg:"Success review removed"})

}

exports.getSingleProductsReviews = async(req, res)=>{
    const {id:productId} = req.params
    const reviews = await Review.find({product:productId})

    res.status(StatusCodes.OK).json({reviews, count: reviews.length })
}