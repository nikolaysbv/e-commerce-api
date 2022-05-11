const express = require("express")
const router = express.Router()
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication")
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController")

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin", "owner"), getAllUsers)

router.route("/showMe").get(authenticateUser, showCurrentUser)

router.route("/updateUser").patch(authenticateUser, updateUser)

router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword)

// needs to be last so that id param is not confused with "showMe" or "updateUser"
router.route("/:id").get(authenticateUser, getSingleUser)

module.exports = router
