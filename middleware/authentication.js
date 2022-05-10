const CustomError = require("../errors")
const { isTokenValid } = require("../utils")

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token

  // check if token is available
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid")
  }

  try {
    // check if token is valid
    //jwt.verify returns the payload of the token
    const { name, userId, role } = isTokenValid({ token })

    // attach user properties to the req object
    req.user = { name, userId, role }

    next()
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid")
  }
}

// check if user is admin
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      )
    }

    next()
  }
}

module.exports = {
  authenticateUser,
  authorizePermissions,
}
