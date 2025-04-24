const express = require('express');
require('dotenv').config();
const cron = require('node-cron');
const app = express();
const routes = require('./routes/Sales');
const { loadCSVData } = require('./services/parse');

app.use(express.json());
app.use('/api', routes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Daily refresh at 2 AM
cron.schedule('* 2 * * *', async () => {
  console.log('Running daily data refresh...');
  await loadCSVData();
});
