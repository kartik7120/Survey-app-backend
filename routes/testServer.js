// import Express from "express";
const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
    res.contentType("html");
    res.send("<p>Server is working properely</p>");
})

module.exports = router;