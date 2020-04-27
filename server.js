if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// const cors = require("cors");
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");

require("./middleware/passport")(passport);
// app.use(passport.session());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.set("view engine", "ejs");

// app.use(cors);
app.set("layout", "layouts/layout");
app.use("/uploads", express.static("uploads"));
app.use(expressLayouts);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const mainRouter = require("./routes/main");
const adminRouter = require("./routes/admin");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = process.env.DATABASE_URL;
// console.log(uri);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.get("/", (req, res) => {
  res.render("adminlogin");
});

app.use("/", mainRouter);
app.use("/admin", adminRouter);

app.listen(process.env.PORT || 3000);
