var express = require("express");
var router = express.Router();
const userController = require("../controllers/user");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/userStatus", auth, userController.userStatus);

module.exports = router;
