const Order = require('../models/Order');
const Product = require('../models/Product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'randomValue';
  return { client_secret, amount };
};

exports.createOrder = async (req, res) => {
    const {items:cartItems, tax, shippingFee} =req.body

    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('no cartitems provided')
    }

    if(!tax || !shippingFee){
        throw new CustomError.NotFoundError('please provide tax and shipping fee')
    }

    let orderItems = []
    let subtotal = 0
    //to check if product in cartitem is exist or not then destruct my product data from db to the cartitems, then calculate subtotal
    for(const item of cartItems){
        const isProduct = await  Product.findOne({_id:item.product})
        // console.log(isProduct)
        if(!isProduct){
            throw new CustomError.NotFoundError(`no product with id : ${item.product}`)
        }
        const {name, price, image, _id} = isProduct
        const singleOrderItem = {
            amount:item.amount,
            name,price,image,
            product:_id
        }
        // add item to order
        orderItems = [...orderItems, singleOrderItem]
        // calculate subtotal of my item
        subtotal += item.amount * price
    }
    //calculate total for order
    const total = tax + shippingFee + subtotal
    //get client secret
    const paymentIntend = await fakeStripeAPI({
        amount:total,
        currency:'usd'
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret:paymentIntend.client_secret,
        user:req.user.userId
    })
    res.status(StatusCodes.CREATED).json({order, clientSecret:order.clientSecret})

};
exports.getAllOrders = async (req, res) => {
const orders = await Order.find({})
res.status(StatusCodes.OK).json({Orders:orders})
};

exports.getSingleOrder = async (req, res) => {
  const{id:orderId} = req.params
  const order = await Order.findOne({_id:orderId})
  if(!order){
    throw new CustomError.NotFoundError(`no order with id : ${orderId}`)
  }
  checkPermissions(req.user,order.user)
  res.status(StatusCodes.OK).json({Order:order})
};

exports.getCurrentUserOrders = async (req, res) => {

  const userOrder = await Order.find({user:req.user.userId})
  if(!userOrder){
    throw new CustomError.NotFoundError(`no user's order with id : ${req.user.body}`)
  }
  res.status(StatusCodes.OK).json({UserOrder: userOrder, count:userOrder.length})
//   console.log(userOrder);

};
exports.updateOrder = async (req, res) => {
    const{id:orderId} = req.params
    const {paymentIntend} = req.body

    const order = await Order.findOne({_id:orderId})
    if(!order){
      throw new CustomError.NotFoundError(`no order with id : ${orderId}`)
    }
    checkPermissions(req.user,order.user)

    order.paymentIntend = paymentIntend
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({order})
};


