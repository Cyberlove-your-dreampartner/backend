require("dotenv").config();

const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadVideo = async (videoURL) => {
  try {
    const res = await cloudinary.uploader.upload(videoURL, {
      resource_type: "video",
      folder: "idle-videos",
      overwrite: true,
      invalidate: true,
    });
    return res.secure_url;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { uploadVideo };
