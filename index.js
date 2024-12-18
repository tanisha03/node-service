// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Initialize the express app and port
const app = express();
const PORT = 3001; // Change this to any port you prefer

dotenv.config();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Create an HTTP server to share with Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with the same server
const io = new Server(server, {
  path: '/api/socket', // Path must match the client-side WebSocket connection
  cors: {
    origin: 'https://saas-dashboard-henna.vercel.app',  // Allow only your frontend domain
    // origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

console.log(io);

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('join_chat', (userId) => {
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    socket.userId = userId; // Store the userId for the socket
  });

  socket.on('send_message', (userId, message) => {
    console.log(`Message from ${userId}: ${message}`);
    // Broadcast the message to other users (e.g., admins, support agents)
    socket.broadcast.emit('receive_message', { userId, message });
  });

  socket.on('send_message_to_user', (userId, message) => {
    // Find the specific user socket by userId and send them a message
    const userSocket = Array.from(io.sockets.sockets).find(
      ([_, s]) => s.userId === userId
    );

    if (userSocket) {
      userSocket[1].emit('receive_message', { userId: 'admin', message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// io.on('e')

// API Routes
app.get('/', async (req, res) => {
  res.status(200).json('Up & Working');
});

// Your get-interaction endpoint
app.get('/api/get-interaction', async (req, res) => {
  try {
    const { id } = req.query;
    const { getAllOffers } = require('./utils/supabaseHelpers');

    const { data, error } = await getAllOffers();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Filter with data
    const filteredOffers = data?.filter((offer) => {
      if (!offer.is_active) {
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
      return currentDate >= start && currentDate <= end;
    }).filter((offer) => {
      if(offer?.lead_list){
        if(offer?.lead_list?.[0] === 'all') {
          if(id) return true;
          else return false;
        } else {
          return offer?.lead_list?.includes(id);
        }
      }
      return true;
    }).map((offer) => ({
      id: offer.id,
      format: offer.offer_format,
      ...offer.config,
    }));

    res.status(200).json({ success: true, data: filteredOffers });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/increment-click', async (req, res) => {
  try {
    const { id } = req.body;
    const { incrementField } = require('./utils/supabaseHelpers');

    const { data, error } = await incrementField(id, 'clicks');
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/increment-impressions', async (req, res) => {
  try {
    const { id } = req.body;
    const { incrementField } = require('./utils/supabaseHelpers');

    const { data, error } = await incrementField(id, 'impressions');
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error incrementing impressions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/add-activity', async (req, res) => {
  try {
    const { id, activity } = req.body;
    const { addActivity } = require('./utils/supabaseHelpers');

    const { data, error } = await addActivity(id, activity);
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
