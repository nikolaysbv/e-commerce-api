const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")

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

  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.send("show current user route")
}

const updateUser = async (req, res) => {
  res.send("update user route")
}

const updateUserPassword = async (req, res) => {
  res.send("update user password route")
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
