const express = require('express');
const router = express.Router();
const User = require("../models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const checkUserAuthentication = require("../middleware/checkUserAuthtication");

router.get("/user", checkUserAuthentication, async (req, res, next) => {

  const token = req.header("o-auth-token");
  try {
    const payload = JWT.verify(token, process.env.SECRET);
    const user = await User.findById({ _id: payload.sub }).populate("polls");
    const body = JSON.stringify(user);
    res.contentType("application/json");
    res.json(body);
  }
  catch (error) {
    next(error);
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("Either email or password is wrong");
    }

    const isValid = await bcrypt.compare(`${password}`, user.password);

    if (!isValid) {
      return res.status(406).json("Either email or password is wrong");
    }
    req.user = user;
    const token = JWT.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "1h", subject: `${user._id}` });
    res.cookie("JWTtoken", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
    res.status(200).json({ token, name: user.username, _id: user._id })
  } catch (error) {
    next(error);
  }
})

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, password, email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(406).json("User already exists");
    }

    const name = firstName + " " + lastName;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username: name,
      password: hashedPassword,
      email
    })

    const token = JWT.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: "1h", subject: `${newUser._id}` });
    await newUser.save();
    res.contentType("application/json");
    res.cookie("JWTtoken", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
    res.json({ token, name, _id: newUser._id });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("JWTtoken");
    res.contentType("application/json");
    const body = {
      message: "User logged out"
    }
    res.json(JSON.stringify(body));
  } catch (error) {
    next(error);
  }
})

module.exports = router;
