const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  system: {
    type: String,
  },
  messages: {
    type: Array,
    default: [],
  },
});

ChatSchema.methods.insertMessage = async function (role, content) {
  const chat = this;
  chat.messages = chat.messages.concat({
    role: role,
    content: content,
  });
  await chat.save();
  return chat;
};

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
