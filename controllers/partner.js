require("dotenv").config();
const Partner = require("../models/partner");
const Chat = require("../models/chat");
const Image = require("../models/image");

// get img from ../img/

const generatePartnerImage = async (req, res) => {
  const { origin, hair, hairColor, breast, glasses } = req.body;

  try {
    // origin, hair, hairColor, breast, glasses are optional, check if they are undefined
    // if they are undefined, not put into query
    let query = {};
    if (origin) query.origin = origin;
    if (hair) query.hair = hair;
    if (hairColor) query.hairColor = hairColor;
    if (breast) query.breast = breast;
    if (glasses) query.glasses = glasses;

    // random find 4 images in db
    let images = await Image.aggregate([
      { $match: query },
      { $sample: { size: 6 } },
      { $project: { _id: 1, imgBase64: 1 } },
    ]);
    // change _id to imageId
    images = images.map((image) => {
      image.imageId = image._id;
      delete image._id;
      image.imageBase64 = image.imgBase64;
      delete image.imgBase64;
      return image;
    });
    // return 4 image
    res.status(200).json({ images });
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const characterSetting = async (req, res) => {
  const { nickname, name, MBTI, job, personality } = req.body;
  const userId = req.user._id;

  try {
    if (!userId) {
      res
        .status(201)
        .json({ message: "The user has not yet selected a partner" });
    } else {
      const partner = await Partner.findOne({ userId: userId });

      // update partner
      partner.nickname = nickname;
      partner.name = name;
      partner.MBTI = MBTI;
      partner.job = job;
      partner.personality = personality;
      await partner.save();

      res.status(201).json({ message: "CharacterSetting success" });
    }
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

module.exports = { generatePartnerImage, characterSetting };
