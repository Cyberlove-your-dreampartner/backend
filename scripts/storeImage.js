require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const ProgressBar = require("progress");
const Image = require("../models/image");

const dirPath = process.argv[2];

if(process.env.NODE_ENV !== "development") {
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
    hair = ["straight", "curly", "pigtails"];
    hairColor = [
      "red",
      "blond",
      "brown",
      "blue",
      "green",
      "pink",
      "white",
      "black",
      "purple",
    ];
    breast = ["micromastia", "large breast"];
    glasses = [true, false];
    blockIndex = [14, 67, 307];
    // iterate through all images in the folder
    for (const file of fs.readdirSync(dirPath)) {
      let index = file.split("-")[0];
      index = Number(index);
      // skip the images in the blockIndex
      if (blockIndex.includes(index)) {
        bar.tick();
        continue;
      }
      const imgBase64 = fs.readFileSync(path.join(dirPath, file), "base64");
      // create a new image
      const newImage = await new Image({
        imgBase64: imgBase64,
        glasses: glasses[index % 2],
        breast: breast[Math.floor(index / 2) % 2],
        hairColor: hairColor[Math.floor(index / 4) % 9],
        hair: hair[Math.floor(index / 36) % 3],
        origin: origin[Math.floor(index / 108) % 4],
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
