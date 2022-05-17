// const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Token = require("../models/Token")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
} = require("../utils")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")

const register = async (req, res) => {
  const { email, name, password } = req.body

  // additional check for "uniqueness" of email; the other check is the "unique" property in schema
  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists")
  }

  // create unique verification token for user
  const verificationToken = crypto.randomBytes(40).toString("hex")

  // create user in the users document
  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
  })

  // send email for account verification
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: "http://localhost:3000",
  })

  // send verification token back only while testing in postman
  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  // check if both user and password are provided
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password")
  }

  // find user in db
  const user = await User.findOne({ email })

  // check if user exists
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials")
  }

  // check if password is correct
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials")
  }

  // check if user has verified email
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email")
  }

  // create token user
  const tokenUser = createTokenUser(user)

  // create refresh token
  let refreshToken = ""

  // check for existing token
  const existingToken = await Token.findOne({ user: user._id })

  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials")
    }
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    res.status(StatusCodes.OK).json({ user: tokenUser })
    return
  }

  refreshToken = crypto.randomBytes(40).toString("hex")
  const userAgent = req.headers["user-agent"]
  const ip = req.ip
  const userToken = { refreshToken, ip, userAgent, user: user._id }

  await Token.create(userToken)

  // attach cookie with token to res
  attachCookiesToResponse({ res, user: tokenUser, refreshToken })

  // return user
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId })

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.status(StatusCodes.OK).json({ msg: "user logged out!" })
}

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body

  // find the user who uses this email
  const user = await User.findOne({ email })

  // check if user exists
  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed")
  }

  // check if vtoken in mongo is the same as the one passed
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed")
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ""

  await user.save()

  res.status(StatusCodes.OK).json({ msg: "Email Verified" })
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
}
