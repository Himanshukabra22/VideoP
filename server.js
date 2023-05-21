const express = require('express');
const app = express();
const port = 3000;
const videoQueue = require('./jobProcessor');

app.use(express.json());

// Enable CORS for SSE
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.get('/',(req,res) => {
  res.send("Hello!!");
})

app.get('/jobs/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  const job = await videoQueue.getJob(jobId);
  console.log(job);
  if (!job) {
    res.status(404).json({ status: 'error', message: 'Job not found.' });
    return;
  }
  
  if(job.failedReason !== undefined)
  {
    res.json({status : "not ok"});
  }
  if (job.isCompleted()) {
    res.json({ status: 'ok', processedVideo: job.returnvalue.processedVideo });
    return;
  }
// Job is still in progress
res.json({ status: 'progress', message: 'Job is still in progress.' });
});

app.post('/jobs', async (req, res) => {
  const videoLink = req.body.videoLink;

  const job = await videoQueue.add({ videoLink });
if(job)
{
  res.json({ status: 'ok', jobId: job.id });
}
else
{
  res.json({ status: 'not ok', jobId: job.id });
}
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
