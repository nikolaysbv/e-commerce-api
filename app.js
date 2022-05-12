/* ==============================
          Dependencies
============================== */

//express
const express = require("express")
const app = express()

// external packages
require("dotenv").config()
require("express-async-errors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")

// internal packages
const authRouter = require("./routes/authRoutes")
const userRouter = require("./routes/userRoutes")
const productRouter = require("./routes/productRoutes")
const reviewRouter = require("./routes/reviewRoutes")
const orderRouter = require("./routes/orderRoutes")

// middleware
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

// database
const connectDB = require("./db/connect")

/* ==============================
          Middleware
============================== */

app.set("trust proxy", 1)

app.use(
  rateLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 60,
  })
)

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

// logging http requests
app.use(morgan("tiny"))

// parsing json in req with content-type "application/json"
app.use(express.json())

// parsing cookies in req
app.use(cookieParser(process.env.JWT_SECRET))

// set up public folder as static
app.use(express.static("./public"))

// use the express-fileupload middleware
app.use(fileUpload())

/* ==============================
          Routes
============================== */

// authentication
app.use("/api/v1/auth", authRouter)

// users
app.use("/api/v1/users", userRouter)

// products
app.use("/api/v1/products", productRouter)

// reviews
app.use("/api/v1/reviews", reviewRouter)

// orders
app.use("/api/v1/orders", orderRouter)

app.get("/", (req, res) => {
  res.send("<h2>bc</h2>")
})

/* ==============================
          Error handling
============================== */

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

/* ==============================
          Starting server
============================== */

const port = process.env.PORT || 5000
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
