const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

const registerUser = async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      surname,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
      ],
    });

    const { sub, email, given_name, family_name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: given_name,
        surname: family_name,
        email,
        googleId: sub,
      });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Google login failed" });
  }
};

const getMe = (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { registerUser, loginUser, googleLogin, getMe };
