const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils")

const getAllUsers = async (req, res) => {
  // find all users with role user and remove password fields from response
  const users = await User.find({ role: "user" }).select("-password")

  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  // find all users with specified id and remove password fields from response
  const user = await User.findOne({ _id: req.params.id }).select("-password")

  // check if user exists
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${req.params.id}`)
  }

  checkPermissions(req.user, user._id)

  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
  const { email, name } = req.body

  // check if both email and name have been provided
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all values")
  }

  // find and update name and email of user
  const user = await User.findOne({ _id: req.user.userId })
  user.email = email
  user.name = name
  await user.save()

  // return new cookie to user
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  // get old and new password from the req
  const { oldPassword, newPassword } = req.body

  // check if both have been provided
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values")
  }

  // get user; no point in checking if user exists as req has already passed authenticateUser
  const user = await User.findOne({ _id: req.user.userId })

  // check if oldPassword is correct
  const isPasswordCorrect = await user.comparePassword(oldPassword)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials")
  }

  // set the new password to the user and save user to the db
  user.password = newPassword
  await user.save()

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully!" })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
