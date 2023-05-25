const express = require("express");
const fs = require("fs");
const path = require("path")
const cors = require("cors");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const dbconnect = require("./db/connection.js");
const dataModel = require("./db/model.js");

const app = express();
const port = process.env.PORT || 3000;
const videoQueue = require("./jobProcessor");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// function checkFileExists(filePath) {
//   try {
//     fs.accessSync(filePath, fs.constants.F_OK);
//     return true; // File exists
//   } catch (err) {
//     return false; // File does not exist
//   }
// }
// Enable CORS for SSE
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Hello!!");
});

app.get("/jobs/:jobId", async (req, res) => {
  const jobId = req.params.jobId;
  try {
    // let job = await videoQueue.getJob(jobId);
    let value = await dataModel.findOne({ cryptostring: jobId });
    const job = await videoQueue.getJob(value.id);

    if (!job) {
      res.status(404).json({ status: "not ok", message: "Job not found." });
      return;
    }

    // console.log("DEBUG OPEN");
    // console.log(job);
    // console.log("DEBUG CLOSE");

    // const jobProgress = await job.progress();
    // console.log(`Job progress : ${jobProgress}`);

    if (job.failedReason !== undefined) {
      res.json({ status: "not ok", message: "Job processing failed." });
    }

    const jobFinished = await job.finished();
    console.log(`Job finished : ${jobFinished}`);

    if (jobFinished !== null) {
      const isCompletedJob = await job.isCompleted();
      // console.log(`isCompletedJob : ${isCompletedJob}`);
      if (isCompletedJob) {
        // console.log("JOB COMPLETED");
        // console.log(job.returnvalue);
        // res.json({
        //   status: "ok",
        //   message : "Job processing completed.",
        //   processedVideo: job.returnvalue.processedVideo,
        // });
        const videoPath = path.join(__dirname, "output_files", job.returnvalue.processedVideo); // Path to the video file
        console.log(videoPath);
        // Check if the file exists
        if (fs.existsSync(videoPath)) {
          // Set the appropriate headers for the response
          res.setHeader("Content-Type", "video/mp4");
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=video.mp4"
          );

          // Create a readable stream from the video file
          const stream = fs.createReadStream(videoPath);

          // Pipe the stream into the response to download the file
          stream.pipe(res);
        } else {
          // File not found, send a 404 response
          res.status(404).send("File not found");
        }
        return;
      }
    }
    res.json({
      status: "ok",
      message: "Job is under process.",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({ status: "ok", message: "Job is still in progress." });
  }
});

app.post("/jobs", async (req, res) => {
  const videoLink = req.body.videoLink;
  try {
    const job = await videoQueue.add({ videoLink });
    if (job) {
      let cryptostring = crypto.randomBytes(3).toString("hex");
      const user = await dataModel.create({
        url: videoLink,
        id: job.id,
        cryptostring,
        date: Date.now(),
      });
      if (user) {
        res.json({
          status: "ok",
          message: "Video is added for further processing",
          jobId: cryptostring,
        });
      }
    } else {
      res.json({
        status: "not ok",
        message: "Job created but not saved in db.",
      });
    }
  } catch (error) {
    res.json({ status: "not ok", error });
  }
});

const serverStart = async () => {
  try {
    await dbconnect(process.env.MONGO_URI);
    console.log("Connected to the DB");
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

serverStart();
