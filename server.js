const express = require("express");
const fs = require('fs');

const app = express();
const port = 3000;
const videoQueue = require("./jobProcessor");

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
    const job = await videoQueue.getJob(jobId);

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
      res.json({ status: "not ok", message : "Job processing failed."});
    }

    const jobFinished = await job.finished();
    console.log(`Job finished : ${jobFinished}`);

    if(jobFinished!==null)
    {
      const isCompletedJob = await job.isCompleted();
      // console.log(`isCompletedJob : ${isCompletedJob}`);
      if (isCompletedJob) {
        console.log("JOB COMPLETED");
        res.json({
          status: "ok",
          message : "Job processing completed.",
          processedVideo: job.returnvalue.processedVideo,
        });
        return;
      }
    }
    res.json({
      status: "ok",
      message : "Job is under process."
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
      res.json({ status: "ok", jobId: job.id });
    } else {
      res.json({ status: "not ok" });
    }
  } catch (error) {
    res.json({ status: "not ok", error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
