// backend/models/Video.js

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  filePath: String,
});

module.exports = mongoose.model("Video", videoSchema);
