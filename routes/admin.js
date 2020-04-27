const express = require("express");
const router = express.Router();
const multer = require("multer");
const passport = require("passport");
const bcrypt = require("bcrypt");
const fs = require("fs");

const News = require("../models/news");
const Admin = require("../models/admins");

const { forwardAuthenticated } = require("../middleware/adminauth");
const { ensureAuthenticated } = require("../middleware/adminauth");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/news");
  },
  filename: function (req, file, cb) {
    var fileFormat = file.originalname.split(".");
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "." +
        fileFormat[fileFormat.length - 1]
    );
  },
});

var upload = multer({ storage: storage });

router.post("/create", (req, res, next) => {
  const username = req.body.username;
  const pwd = req.body.password;
  const password = bcrypt.hashSync(pwd, 10);
  const newAdmin = new Admin({
    username,
    password,
  });

  newAdmin
    .save()
    .then(() => res.json({ message: "Admin created successfully" }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.post("/", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/news",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);
});

router.get("/news", ensureAuthenticated, (req, res, next) => {
  News.find()
    .then((news) => res.render("news", { news: news }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.post("/news", upload.single("imageSrc"), (req, res, next) => {
  const newsHeader = req.body.newsHeader;
  const description = req.body.description;
  const type = req.body.type;
  const source = req.body.source;

  const imageSrc = "uploads/news/" + req.file.filename;
  // console.log(newsHeader);
  // console.log(description);
  // console.log(type);
  // console.log(imageSrc);

  const newNews = new News({
    newsHeader,
    imageSrc,
    source,
    description,
    type,
  });

  newNews
    .save()
    .then(() => res.redirect("/admin/news"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.get("/news/delete/:id", async (req, res, next) => {
  const id = req.params.id;
  await News.findById(id).then((news) => {
    fs.unlink(`${news.imageSrc}`, (err) => {
      if (err) throw err;
      console.log(`${news.imageSrc} was deleted `);
    });
    news.remove();
  });
  res.redirect("/admin/news");
});

router.get("/news/archive/:id", async (req, res, next) => {
  const id = req.params.id;
  const time = new Date(Date.now());
  console.log(time);
  await News.findOneAndUpdate(
    { _id: id },
    {
      archdate: time,
      archive: true,
      status: false,
    },
    { new: true }
  );
  res.redirect("/admin/news");
});

router.get("/news/publish/:id", async (req, res, next) => {
  const id = req.params.id;
  const time = new Date(Date.now());
  // console.log(time);
  await News.findOneAndUpdate(
    { _id: id },
    {
      pubdate: time,
      status: true,
    },
    { new: true }
  );
  res.redirect("/admin/news");
});

router.get("/news/unpublish/:id", async (req, res, next) => {
  const id = req.params.id;
  const time = new Date(Date.now());
  // console.log(time);
  await News.findOneAndUpdate(
    { _id: id },
    {
      status: false,
      unpubdate: time,
    },
    { new: true }
  );
  res.redirect("/admin/news");
});

router.get("/news/restore/:id", async (req, res, next) => {
  const id = req.params.id;
  await News.findOneAndUpdate(
    { _id: id },
    {
      archive: false,
    },
    { new: true }
  );
  res.redirect("/admin/news");
});

router.post(
  "/news/update/:id",
  upload.single("imageSrc"),
  async (req, res, next) => {
    const id = req.params.id;
    const newsHeader = req.body.newsHeader;
    const description = req.body.description;
    const source = req.body.source;
    const type = req.body.type;
    // console.log(newsHeader);
    // console.log(description);
    // console.log(type);
    if (req.file != undefined) {
      const imageSrc = "uploads/news/" + req.file.filename;
      // console.log(imageSrc);
      await News.findOneAndUpdate(
        { _id: id },
        {
          newsHeader,
          description,
          type,
          imageSrc,
          source,
        },
        { new: true }
      );
      res.redirect("/admin/news");
    }

    await News.findOneAndUpdate(
      { _id: id },
      {
        newsHeader,
        description,
        type,
        source,
      },
      { new: true }
    );
    res.redirect("/admin/news");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
