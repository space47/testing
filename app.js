require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload')

const rateLimiter= require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
// database
const connectDB = require("./db/connect");
// import router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')


// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { authenticateUser } = require("./middleware/authentication");

app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60
}))

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(morgan("tiny"));
app.use(express.json());
//using jwt_secret to again parse signed cookie to token
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload())

// swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// route
app.get("/", (req, res) => {
  res.send("E commerce");
});

app.get('/a',(req,res)=> {
  res.send('<h1>E-Comm</h1><a href = "/api-docs">Document</a>')
})

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.get("/api/v1", (req, res) => {
  // if signed during creation then have to use .signedcookie
  console.log(req.signedCookies);
  res.send("E commerce");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders",authenticateUser,orderRouter)

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening to port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
