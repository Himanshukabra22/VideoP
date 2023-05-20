const express = require('express');
const app = express();
const port = 3000;
const videoQueue = require('./jobProcessor');

app.use(express.json());

app.post('/jobs', async (req, res) => {
  const videoLink = req.body.videoLink;

  // Add the video processing job to the queue
  let result = await videoQueue.add({ videoLink });
  
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
