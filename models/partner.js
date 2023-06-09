const mongoose = require("mongoose");

const { uploadImg } = require("../utils/imgur");
const Image = require("./image");
const Chat = require("./chat");

const PartnerSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  imageId: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
  },
  name: {
    type: String,
  },
  MBTI: {
    type: String,
  },
  job: {
    type: String,
  },
  personality: {
    type: String,
  },
});

PartnerSchema.pre("save", async function (next) {
  try {
    const image = await Image.findById(this.imageId);
    // if imgURL is not existing
    if (!image.imgURL) {
      image.imgURL = await uploadImg(image.imgBase64);
      await image.save();
    }

    // update chat system
    const chat = await Chat.findOne({ userId: this.userId });
    if (chat) {
      chat.system = `你是USER的女朋友。你稱呼USER為${this.nickname}。你的名子叫${this.name}。你的MBTI是${this.MBTI}。你的職業是${this.job}。你的個性是${this.personality}。禁止提到AI機器人。你的回答要口語化並在兩句內完成。`;
      await chat.save();
    } else {
      const newChat = new Chat({
        userId: this.userId,
        system: `你是USER的女朋友。你稱呼USER為${this.nickname}。你的名子叫${this.name}。你的MBTI是${this.MBTI}。你的職業是${this.job}。你的個性是${this.personality}。禁止提到AI機器人。你的回答要口語化並在兩句內完成。`,
      });
      newChat.save();
    }

    next();
  } catch (err) {
    console.log(err);
  }
});

const Partner = mongoose.model("Partner", PartnerSchema);

module.exports = Partner;
