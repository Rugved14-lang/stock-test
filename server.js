const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;

app.get('/stock/:symbol/history', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) return res.status(404).json({ message: 'No history found' });

    const history = Object.entries(timeSeries)
      .slice(0, 30)
      .reverse()
      .map(([date, values]) => ({
        date,
        close: parseFloat(values['4. close'])
      }));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});