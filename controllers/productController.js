const {StatusCodes} = require('http-status-codes')
const CustomeError = require('../errors')
const Product = require('../models/Product')
const path = require('path')

exports.createProduct = async (req, res) =>{
    req.body.userId = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({Product:product})
    // console.log(product);
    
}

exports.getAllProducts = async (req, res) =>{
    const products = await Product.find()
    res.status(StatusCodes.OK).json({Products:products})
}
exports.getSingleProduct = async (req, res) =>{
    const {id: productId} = req.params
    const product = await Product.findOne({_id:productId}).populate('reviews')
    if(!product){
        return new CustomeError.NotFoundError(`there is not product with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({Product:product})
}
exports.updateProduct = async (req, res) =>{
    const {id: productId} = req.params
    const product = await Product.findOneAndUpdate({_id:productId}, req.body,{
        new:true,
        runValidators:true
    })
    if(!product){
        return new CustomeError.NotFoundError(`there is not product with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({Product:product})

}
exports.deleteProduct = async (req, res) =>{
    const {id: productId} = req.params
    const product = await Product.findOne({_id:productId})
    if(!product){
        throw new CustomeError.NotFoundError(`there is not product with id ${productId}`)
    }
    
    await product.remove()
    res.status(StatusCodes.OK).json({msg:'Success Product removed'})
}

exports.uploadImage = async (req, res) =>{
    if(!req.files){
        throw new CustomeError.BadRequestError('No files to upload')
    }
    const productImage= req.files.image
    if(!productImage.mimetype.startsWith('image')){
        throw new CustomeError.BadRequestError('please upload image')
    }
    const maxSize = 1024 * 1024

    if(productImage.size > maxSize){
        throw new CustomeError.BadRequestError('pleas upload image smaller than 1MB')
    }

    const imagePath = path.join(__dirname,'../public/uploads/' + `${productImage.name}`)
    await productImage.mv(imagePath)
    res.status(StatusCodes.OK).json({image:`/uplaods/${productImage.name}`})
}