import express from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const MESSAGES_TABLE = process.env.MESSAGES_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

app.get('/users', async (req, res) => {
  try {
    const params = {
      TableName: USERS_TABLE
    };

    const data = await dynamoDB.scan(params).promise();
    res.json({ users: data.Items });
  } catch (error) {
    console.error('DynamoDB Error (users):', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-message", async (req, res) => {
  const { conversationId, sender, receiver, message } = req.body;

  if (!conversationId || !sender || !receiver || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const params = {
    TableName: MESSAGES_TABLE,
    Item: {
      conversationId,
      timestamp: Date.now(), // Use current time as sort key
      sender,
      receiver,
      message
    }
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }

  io.emit('new-message', {
    conversationId,
    sender,
    receiver,
    message,
    timestamp: Date.now()
  });  
});

app.get("/get-messages", async (req, res) => {
  const { conversationId } = req.query;

  if (!conversationId) {
    return res.status(400).json({ success: false, error: "conversationId is required." });
  }

  const params = {
    TableName: MESSAGES_TABLE,
    KeyConditionExpression: "conversationId = :id",
    ExpressionAttributeValues: {
      ":id": conversationId
    },
    ScanIndexForward: true // true = chronological order, false = newest first
  };

  try {
    const data = await dynamoDB.query(params).promise();
    res.json({ success: true, messages: data.Items });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // allow your frontend
    methods: ["GET", "POST"]
  }
});

const connectedSockets = new Set();

io.on('connection', (socket) => {
  connectedSockets.add(socket.id);
  console.log('🟢 Connected:', socket.id, '| Total:', connectedSockets.size);

  socket.on('disconnect', () => {
    connectedSockets.delete(socket.id);
    console.log('🔴 Disconnected:', socket.id, '| Total:', connectedSockets.size);
  });

  socket.on('typing', ({ conversationId, sender }) => {
    socket.broadcast.emit('user-typing', { conversationId, sender });
  });  
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
