const express = require("express");
const router = express.Router();

const News = require("../models/news");

router.get("/news", (req, res) => {
  News.find()
    .then((news) => res.json(news))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
