const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;

app.use(cors());

app.get('/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json({
      symbol: data['01. symbol'],
      price: data['05. price'],
      change: data['09. change'],
      changePercent: data['10. change percent'],
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

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
  console.log(`Server running on port ${PORT}`);
});