// const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const { attachCookiesToResponse, createTokenUser } = require("../utils")
const crypto = require("crypto")

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

  // send verification token back only while testing in postman
  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
    verificationToken: user.verificationToken,
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

  // attach cookie with token to res
  attachCookiesToResponse({ res, user: tokenUser })

  // return user
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: "user logged out!" })
}

module.exports = {
  register,
  login,
  logout,
}
