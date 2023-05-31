const Partner = require("../models/partner");
const Image = require("../models/image");
const Chat = require("../models/chat");

const OPENAI = require("../utils/openai");
const DID = require("../utils/d-id");

const getImgURL = async (req, res) => {
  const userId = req.user._id;
  try {
    const partner = await Partner.findOne({ userId: userId });

    if (!partner) {
      res.status(404).json({ message: "Partner not found" });
    } else {
      const image = await Image.findOne({ _id: partner.imageId });
      res.status(200).json({ imgURL: image.imgURL });
    }
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const replyMessage = async (req, res) => {
  const userId = req.user._id;
  const { message } = req.body;

  try {
    // check chat is exist
    let chat = await Chat.findOne({ userId: userId });
    if (!chat) {
      chat = new Chat({
        userId: userId,
      });
      await chat.save();
    }
    // insert message
    await chat.insertMessage("user", message);
    // get reply
    // only get less 10 messages
    const reply = await OPENAI.getReply(chat.system, chat.messages.slice(-16));
    // insert reply
    await chat.insertMessage(reply.role, reply.content);

    let script = {
      type: "text",
      input: reply.content,
      ssml: true,
      provider: {
        type: "microsoft",
        voice_id: "zh-TW-HsiaoChenNeural",
      },
    };

    let config = {
      stitch: true,
    };

    res.status(200).json({ script: script, config: config });
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const getIdleVideo = async (req, res) => {
  const userId = req.user._id;

  try {
    const partner = await Partner.findOne({ userId: userId });

    if (!partner) {
      res.status(404).json({ message: "Partner not found" });
    } else {
      const image = await Image.findOne({ _id: partner.imageId });
      if (!image) {
        res.status(404).json({ message: "You haven't chosen partner yet" });
      }
      if (!image.videoURL) {
        image.videoURL = await DID.getIdleVideoURL(image.videoId);
        await image.save();
      }
      res.status(200).json({ videoURL: image.videoURL });
    }
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};

const getChatHistory = async (req, res) => {
  const userId = req.user._id;
  try {
    const chat = await Chat.findOne({ userId: userId });

    if (!chat) {
      res.status(404).json({ message: "Partner not found" });
    } else {
      res.status(200).json({ chatHistory: chat.messages });
    }
  } catch (err) {
    console.log(err);
    if (err.name === undefined || err.name === "")
      res.status(500).json({ message: "Internal server error" });
    else res.status(409).json({ message: err.name + " " + err.message });
  }
};
module.exports = { getImgURL, replyMessage, getIdleVideo, getChatHistory };
