require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const ProgressBar = require("progress");
const Image = require("../models/image");

const dirPath = process.argv[2];

if (process.env.NODE_ENV !== "development") {
  mongoose.connect(process.env.MONGODB_URL);
}

const bar = new ProgressBar("store images [:bar] :percent :etas", {
  complete: "=",
  incomplete: " ",
  width: 20,
  total: fs.readdirSync(dirPath).length,
});

const storeImage = async () => {
  try {
    // iterate through all images in the folder
    origin = ["Japanese", "Korean", "Chinese", "European"];
    hair = ["straight", "twintails", "short"];
    hairColor = ["red", "blond", "brown", "pink", "white", "purple"];
    const n = origin.length + hair.length + hairColor.length;
    // iterate through all images in the folder
    for (const file of fs.readdirSync(dirPath)) {
      let index = file.split("-")[0];
      index = Number(index) - 1;
      idxHairColor = index % hairColor.length;
      index = Math.floor(index / hairColor.length);
      idxHair = index % hair.length;
      index = Math.floor(index / hair.length);
      idxOrigin = index % origin.length;
      const imgBase64 = fs.readFileSync(path.join(dirPath, file), "base64");
      // create a new image
      const newImage = await new Image({
        imgBase64: imgBase64,
        origin: origin[idxOrigin],
        hair: hair[idxHair],
        hairColor: hairColor[idxHairColor],
      });
      // save the image
      await newImage.save();
      bar.tick();
    }
    console.log("All images stored in MongoDB");
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

storeImage();
