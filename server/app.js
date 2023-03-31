const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.ATLAS_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const videoSchema = new mongoose.Schema({
  cid: String,
  title: String,
  description: String,
  tags: [
    {
      type: String,
    },
  ],
  category: [
    {
      type: String,
    },
  ],
  creater: String,
  mint: String,
});

videoSchema.index({ cid: 1 }, { unique: true });

const Video = mongoose.model("Video", videoSchema);

app.post("/UploadVideo", async (req, res) => {
  const video = new Video({
    cid: req.body.cid,
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags,
    category: req.body.category,
    creater: req.body.creater,
    mint: "",
  });
  try {
    await video.save();
    res.send({ success: true, message: "Video Uploaded" });
  } catch (error) {
    console.log(error);
    res.status(422).send({ success: false, message: "Video already exist!" });
  }
});

app.post("/saveMint", async (req, res) => {
  await Video.updateOne({ cid: req.body.cid }, { mint: req.body.mint }).exec();
});

app.get("/getVideos", async (req, res) => {
  const cids = await Video.find({}, "cid title description mint").exec();
  res.send(cids);
});

app.get("/getVideo/:cid", async (req, res) => {
  const videoDetails = await Video.findOne({ cid: req.params.cid }).exec();
  res.send(videoDetails);
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
