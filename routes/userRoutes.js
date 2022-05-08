const express = require("express")
const router = express.Router()

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController")

router.route("/").get(getAllUsers)

router.route("/showMe").get(showCurrentUser)

router.route("/updateUser").patch(updateUser)

router.route("/updateUserPassword").patch(updateUserPassword)

// needs to be last so that id param is not confused with "showMe" or "updateUser"
router.route("/:id").get(getSingleUser)

module.exports = router
