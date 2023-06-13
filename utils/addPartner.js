require("dotenv").config();
const Partner = require("../models/partner");
const Image = require("../models/image");

const DID = require("./d-id");
const CLOUDINARY = require("./cloudinary");

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
      if (!image.videoId) {
        const videoId = await DID.createIdleVideo(image.imgURL);
        image.videoId = videoId;
        await image.save();
      }
      console.log("videoId", image.videoId);
      const didVideoURL = await DID.getIdleVideoURL(image.videoId);
      image.videoURL = await CLOUDINARY.uploadVideo(didVideoURL);
      await image.save();
    }
  } catch (err) {
    console.log(err);
    throw new Error("Failed to add partner");
  }
};

module.exports = { addPartner };
