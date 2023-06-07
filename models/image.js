const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  imgBase64: {
    type: String,
    required: true,
  },
  imgURL: {
    type: String,
  },
  videoId: {
    type: String,
  },
  videoURL: {
    type: String,
  },
  origin: {
    type: String,
  },
  hair: {
    type: String,
  },
  hairColor: {
    type: String,
  },
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
