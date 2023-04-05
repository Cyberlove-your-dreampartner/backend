require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // validate user
    const newUser = new User({
      username,
      email,
      password,
    });
    // check if user exists
    const userExists = await User.findOne({ username: newUser.username });
    if (userExists) {
      res.status(409).json({ message: "User already exists" });
    } else {
      await newUser.save();
      res.status(201).json({ message: "User created" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // check if user exists
    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(409).json({ message: "User not found" });
    } else {
      // check if password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        res.status(409).json({ message: "Password incorrect" });
      } else {
        // generate jwt token
        const token = jwt.sign(
          {
            username: user.username,
            email: user.email,
            _id: user._id,
          },
          process.env.JWT_SECRET
        );
        res.status(200).json({ authorization: token });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
};
