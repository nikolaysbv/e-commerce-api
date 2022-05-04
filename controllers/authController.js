const jwt = require("jsonwebtoken")
const { StatusCodes } = require("http-status-codes")
const User = require("../models/User")
const CustomError = require("../errors")
const { createJWT } = require("../utils")

const register = async (req, res) => {
  const { email, name, password } = req.body

  // additional check for "uniqueness" of email; the other check is the "unique" property in schema
  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists")
  }

  // create user in the users document
  const user = await User.create({ name, email, password })

  // create a jwt for the user
  const tokenUser = { name: user.name, userId: user._id, role: user.role }
  const token = createJWT({ payload: tokenUser })

  res.status(StatusCodes.CREATED).json({ user: tokenUser, token })
}

const login = async (req, res) => {
  res.send("login user")
}

const logout = async (req, res) => {
  res.send("logout user")
}

module.exports = {
  register,
  login,
  logout,
}
