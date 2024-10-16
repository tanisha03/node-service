// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();
const PORT = 3001; // Change this to any port you prefer

dotenv.config();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.status(200).json('Up & Working');
});

// Your get-interaction endpoint
app.get('/api/get-interaction', async (req, res) => {
  try {
    // Import your existing Supabase function or logic
    const { getAllOffers } = require('./utils/supabaseHelpers');

    const { data, error } = await getAllOffers();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    //filter with data
    const filteredOffers = data?.filter((offer) => {
      if(!offer.is_active){
        return false;
      }
      const { start_date, end_date } = offer.config;
      const currentDate = new Date();
      if (start_date && !end_date) {
        const filterStartDate = new Date(start_date);
        return currentDate >= filterStartDate;
      }
      const start = new Date(start_date);
      const end = new Date(end_date);
      return currentDate >= start && start <= end;
    }).map(offer => offer.config);

    res.status(200).json({ success: true, data: filteredOffers });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
