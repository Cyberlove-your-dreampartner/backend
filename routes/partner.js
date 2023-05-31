var express = require("express");
var router = express.Router();

const auth = require("../middlewares/auth");
const partnerController = require("../controllers/partner");

router.post("/", auth, partnerController.choosePartner);
router.post("/generateImage", auth, partnerController.generatePartnerImage);
router.post("/characterSetting", auth, partnerController.characterSetting);
router.post("/image", auth, partnerController.uploadImage);

module.exports = router;
