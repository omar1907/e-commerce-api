const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
name : {
    type:String,
    trim:true,
    required:[true,'provide product name '],
    maxlenght:[100,'cannot be more than 100 characters']
},
 price: {
    type:Number,
    required:[true,'provide product price '],
},
 description: {
    type:String,
    required:[true,'provide product description '],
    maxlenght:[1000,'cannot be more than 1000 characters']
},
 image: {
    type:String,
    default:'/uploads/example.jpeg'
},
 category: {
    type:String,
    required:[true,'provide product category '],
    enum:['office','kitchen','bedroom']
},
 company: {
    type:String,
    required:[true,'provide product company '],
    enum:{
        values:['ikea','liddy','marcos'],
        message:'{VALUE} is not supported'
    }
},
 colors: {
    type:[String],
    required:true,
},
 featured: {
    type:Boolean,
    default:false
},
 freeShipping: {
    type:Boolean,
    default:false
},
 inventory:{
    type:Number,
    required:true,
    default:15
},
 averageRating:{
    type:Number,
    default:0
},
numOfReviews:{
    type:Number,
    default:0
},
 userId:{
    type:mongoose.Types.ObjectId,
    ref:'user',
    required:true
 },
},
{timestamps:true, toJSON:{virtuals:true},toObject:{virtuals:true}}
)

productSchema.virtual('reviews',{
    ref:"review",
    localField:'_id',
    foreignField:'product',
    justOne:false,
    // match:{rating:5}
})


productSchema.pre('remove',async function(next){
    await this.model('review').deleteMany({product:this._id})
})
module.exports = mongoose.model('product',productSchema)