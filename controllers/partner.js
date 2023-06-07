require("dotenv").config();
const Partner = require("../models/partner");
const Image = require("../models/image");

const DID = require("../utils/d-id");
const CLOUDINARY = require("../utils/cloudinary");
const IMGUR = require("../utils/imgur");

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
        .status(409)
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

const choosePartner = async (req, res) => {
  const { imageId } = req.body;
  const userId = req.user._id;

  try {
    await addPartner(imageId, userId);
    res.status(201).json({ message: "Partner created" });
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const uploadImage = async (req, res) => {
  const { imageBase64 } = req.body;
  const userId = req.user._id;

  try {
    // upload image to cloudinary
    const imgURL = await IMGUR.uploadImg(imageBase64);
    // insert a new image
    const newImage = new Image({
      userId,
      imgURL,
      imgBase64: imageBase64,
    });
    await newImage.save();
    const imageId = newImage._id;
    await addPartner(imageId, userId);
    res.status(201).json({ message: "Image created" });
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const addPartner = async (imageId, userId) => {
  try {
    // insert a new partner
    const newPartner = new Partner({
      userId,
      imageId,
    });
    await newPartner.save();
    const image = await Image.findById(imageId);
    if (!image.videoURL) {
      const videoId = await DID.createIdleVideo(image.imgURL);
      const didVideoURL = await DID.getIdleVideoURL(videoId);
      image.videoURL = await CLOUDINARY.uploadVideo(didVideoURL);
      await image.save();
    }
  } catch (err) {
    console.log(err);
    throw new Error("Failed to add partner");
  }
};
module.exports = {
  generatePartnerImage,
  characterSetting,
  choosePartner,
  uploadImage,
};
