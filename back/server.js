// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const fs = require("fs");

const app = express();
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// mongodb connection
const con = require("./db/connection.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
app.use(express.static("uploads"));

const upload = multer({ storage });

const Video = require("./models/video");

// Upload video
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { originalname, filename, path: filePath } = req.file;
    const { title, description } = req.body;

    const newVideo = new Video({
      title,
      filename,
      filePath,
      description,
    });
    await newVideo.save();
    res
      .status(201)
      .json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update video title and description
app.put("/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const video = await Video.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video updated successfully", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all videos
app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete video
app.delete("/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    await Video.deleteOne({ _id: id });

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

con
  .then((db) => {
    if (!db) return process.exit(1);

    const server = app.listen(port, () => {
      console.log(`Server is running on port: http://localhost:${port}`);
    });

    app.on("error", (err) =>
      console.log(`Failed To Connect with HTTP Server : ${err}`)
    );
  })
  .catch((error) => {
    console.log(`Connection Failed...! ${error}`);
  });
