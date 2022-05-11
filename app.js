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

// internal packages
const authRouter = require("./routes/authRoutes")
const userRouter = require("./routes/userRoutes")
const productRouter = require("./routes/productRoutes")
const reviewRouter = require("./routes/reviewRoutes")

// middleware
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

// database
const connectDB = require("./db/connect")

/* ==============================
          Middleware
============================== */

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
