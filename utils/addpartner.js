require("dotenv").config();
const Partner = require("../models/partner");
const Image = require("../models/image");

const DID = require("../utils/d-id");
const CLOUDINARY = require("../utils/cloudinary");

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

module.exports = { addPartner };