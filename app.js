require('dotenv').config()
require('express-async-errors')
//EXPRESS
const express = require('express')
app =express()
// console.log(app)
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')


//DATABASE
const connectDb = require('./db/connect')

//Routes
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')
//MIDDLEWARE

const notFound = require('./middleware/not-found')
const errorHandlerMiddleWare = require('./middleware/error-handler')
app.set('trust proxy',1)

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max:60,
}))

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())


app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileUpload())


app.use('/api/v1/auth',authRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)
app.use(notFound)
app.use(errorHandlerMiddleWare)
const port = process.env.PORT || 3000
const start = async ()=>{
    try{
        await connectDb(process.env.MONGO_URL)
        app.listen(port,console.log(`Server is listening at port: ${port}`))
    }catch(error){
        console.log(error)
    }
}

start()