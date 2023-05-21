var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const userController = require("../controllers/user");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/status", auth, userController.userStatus);

module.exports = router;
