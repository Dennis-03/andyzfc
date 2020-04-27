const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  newsHeader: {
    type: String,
    required: true,
  },
  imageSrc: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  pubdate: {
    type: Date,
    default: Date.now,
  },
  unpubdate: {
    type: Date,
    default: Date.now,
  },
  archdate: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("news", newsSchema);
