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

// internal packages
const authRouter = require("./routes/authRoutes")

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

// authentication
app.use("/api/v1/auth", authRouter)

/* ==============================
          Routes
============================== */

app.get("/", (req, res) => {
  console.log(req.signedCookies)
  // console.log(req.cookies)
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
