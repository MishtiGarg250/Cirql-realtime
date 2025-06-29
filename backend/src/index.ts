// PROJECT STRUCTURE
// - client (Next.js frontend using TypeScript)
// - server (Node.js backend)
// - docker-compose.yml
// - webrtc-server (for signaling)

// ===============================================
// STEP 1: INIT BACKEND (server/index.ts)
// ===============================================

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const SECRET = process.env.JWT_SECRET || 'default_secret';
const SALT_ROUNDS = 10;

// MongoDB Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' }, // URL to profile picture
  friends: [{ type: String }],
  friendRequests: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  type: { type: String},
  isPrivate: { type: Boolean, default: false },
  code: { type: String, unique: true, sparse: true }, // Unique code for private rooms
  createdBy: { type: String, required: true },
  participants: [{ type: String }],
  videoQueue: [{
    url: String,
    score: Number,
    addedBy: String
  }],
  currentVideoIndex: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
  lastSyncTime: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Room = mongoose.model('Room', roomSchema);

// Multer setup for profile picture uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// In-memory storage for active connections
const activeUsers: Record<string, string> = {}; // socketId -> username
const userSockets: Record<string, string> = {}; // username -> socketId

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mishti-chat')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware for HTTP routes
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, SECRET) as { username: string };
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// AUTHENTICATION
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ username: user.username, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username, email: user.email, profilePic: user.profilePic });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body; // login can be username or email
    if (!login || !password) {
      return res.status(400).json({ error: 'Login credential and password required' });
    }
    
    const user = await User.findOne({ 
      $or: [{ username: login }, { email: login }] 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ username: user.username, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username, email: user.email, profilePic: user.profilePic });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile picture upload
app.post('/api/profile-pic', authenticateToken, upload.single('profilePic'), async (req, res) => {
  try {
    const { username } = (req as any).user;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    await User.updateOne({ username }, { profilePic: fileUrl });
    res.json({ profilePic: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Profile update (change profilePic or password)
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { username } = (req as any).user;
    const { password, profilePic } = req.body;
    const update: any = {};
    if (password && password.length >= 6) {
      update.password = await bcrypt.hash(password, SALT_ROUNDS);
    }
    if (profilePic) {
      update.profilePic = profilePic;
    }
    await User.updateOne({ username }, update);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Verify token endpoint
app.get('/api/verify', authenticateToken, async (req, res) => {
  const { username } = (req as any).user;
  const user = await User.findOne({ username });
  res.json({ valid: true, user: { username, profilePic: user?.profilePic || '' } });
});

// Search all users (must come before /api/users/:username)
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const { username } = (req as any).user;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    // Search for users whose username contains the query (case-insensitive)
    const searchQuery = {
      $and: [
        { username: { $regex: q, $options: 'i' } },
        { username: { $ne: username } } // Exclude current user
      ]
    };
    
    const users = await User.find(searchQuery, 'username profilePic').limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile by username
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }, 'username profilePic');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API Routes (protected)
app.get('/api/friends/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = (req as any).user;
    const targetUsername = req.params.username;
    if (username !== targetUsername) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const user = await User.findOne({ username: targetUsername });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Return friend usernames and their profile pics with online status
    const friends = await User.find({ username: { $in: user.friends } }, 'username profilePic');
    const friendsWithOnlineStatus = friends.map(friend => {
      const isOnline = userSockets[friend.username] ? true : false;
      console.log('Friend:', friend.username, 'isOnline:', isOnline);
      return {
        username: friend.username,
        profilePic: friend.profilePic,
        isOnline: isOnline
      };
    });
    
    res.json({ friends: friendsWithOnlineStatus, friendRequests: user.friendRequests });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/messages/:username1/:username2', authenticateToken, async (req, res) => {
  try {
    const { username } = (req as any).user;
    const { username1, username2 } = req.params;
    if (username !== username1 && username !== username2) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const messages = await Message.find({
      $or: [
        { sender: username1, receiver: username2 },
        { sender: username2, receiver: username1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    // Get the user from the Authorization header if present
    const authHeader = req.headers['authorization'];
    let username = null;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer TOKEN
      const payload = verifyToken(token);
      if (payload) {
        username = payload.username;
      }
    }
    
    // Build query: public rooms OR private rooms where user is creator/participant
    let query: any = { isPrivate: false }; // Default to public rooms only
    
    if (username) {
      // If user is authenticated, include their private rooms
      query = {
        $or: [
          { isPrivate: false }, // Public rooms
          { isPrivate: true, createdBy: username }, // Private rooms created by user
          { isPrivate: true, participants: username } // Private rooms where user is participant
        ]
      };
    }
    
    const rooms = await Room.find(query).sort({ createdAt: -1 });
    
    // Add isActive status based on participants
    const roomsWithActivity = rooms.map(room => {
      const roomData = room.toObject ? room.toObject() : room;
      return {
        ...roomData,
        isActive: roomData.participants && roomData.participants.length > 0
      };
    });
    
    res.json(roomsWithActivity);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET) as { username: string; email: string };
  } catch {
    return null;
  }
};

// Helper function to convert Map objects to plain objects for Socket.IO serialization
const serializeRoomForSocket = (room: any) => {
  const roomData = room.toObject ? room.toObject() : room;
  
  return {
    ...roomData,
    isActive: roomData.participants && roomData.participants.length > 0
  };
};

// Helper to generate a random 6-character alphanumeric code
function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0, O, 1, I for clarity
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Socket Middleware with enhanced authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication token required'));
  }
  const payload = verifyToken(token);
  if (!payload) {
    return next(new Error('Invalid or expired token'));
  }
  (socket as any).username = payload.username;
  next();
});

// Socket Handlers
io.on('connection', (socket) => {
  const username = (socket as any).username;
  activeUsers[socket.id] = username;
  userSockets[username] = socket.id;

  // Send online status to friends
  socket.on('online', async () => {
    console.log('User came online:', username);
    const user = await User.findOne({ username });
    if (user && user.friends) {
      user.friends.forEach(friend => {
        const friendSocketId = userSockets[friend];
        if (friendSocketId) {
          console.log('Notifying friend:', friend, 'that', username, 'is online');
          io.to(friendSocketId).emit('friendOnline', username);
        }
      });
    }
  });

  // Friend Requests
  socket.on('sendFriendRequest', async (targetUsername: string) => {
    try {
      if (!targetUsername || targetUsername === username) {
        return socket.emit('friend_request_error', { message: 'Invalid username.' });
      }

      const targetUser = await User.findOne({ username: targetUsername });
      if (!targetUser) {
        return socket.emit('friend_request_error', { message: 'User not found.' });
      }

      if (targetUser.friends.includes(username)) {
        return socket.emit('friend_request_error', { message: 'You are already friends.' });
      }
      
      if (targetUser.friendRequests.includes(username)) {
        return socket.emit('friend_request_error', { message: 'Friend request already sent.' });
      }

      // Add request to target user's list
      targetUser.friendRequests.push(username);
      await targetUser.save();

      // Notify the target user if they are online
      const targetSocketId = userSockets[targetUsername];
      if (targetSocketId) {
        io.to(targetSocketId).emit('friendRequest', username);
      }
      
      // Send success feedback to the sender
      socket.emit('friend_request_success', { message: `Friend request sent to ${targetUsername}.` });

    } catch (error) {
      console.error('Error sending friend request:', error);
      socket.emit('friend_request_error', { message: 'An error occurred.' });
    }
  });

  socket.on('acceptFriendRequest', async (requestUsername: string) => {
    try {
      const user = await User.findOne({ username });
      const requestUser = await User.findOne({ username: requestUsername });
      
      if (!user || !requestUser) return;
      
      if (user.friendRequests.includes(requestUsername)) {
        // Add to friends list for both users
        user.friends.push(requestUsername);
        requestUser.friends.push(username);
        
        // Remove from friend requests
        user.friendRequests = user.friendRequests.filter(u => u !== requestUsername);
        
        await user.save();
        await requestUser.save();
        
        // Notify both users
        const requestSocketId = userSockets[requestUsername];
        if (requestSocketId) {
          io.to(requestSocketId).emit('friendRequestAccepted', username);
        }
        socket.emit('friendRequestAccepted', requestUsername);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  });

  socket.on('rejectFriendRequest', async (requestUsername: string) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return;
      
      user.friendRequests = user.friendRequests.filter(u => u !== requestUsername);
      await user.save();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  });

  // Direct Messages
  socket.on('sendDirectMessage', async ({ receiver, content }) => {
    try {
      if (!receiver || !content || receiver === username) {
        return;
      }
      
      const message = new Message({ sender: username, receiver, content });
      await message.save();
      
      const receiverSocketId = userSockets[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('directMessage', {
          sender: username,
          content,
          timestamp: new Date()
        });
      }
      
      socket.emit('messageSent', { receiver, content });
    } catch (error) {
      console.error('Error sending direct message:', error);
    }
  });

  // Room Management
  socket.on('createRoom', async ({ roomId, title, description, category, type, isPrivate }) => {
    try {
      if (!roomId || !title || !type) {
        return;
      }
      
      // Check if room already exists to prevent duplicates
      const existingRoom = await Room.findOne({ id: roomId });
      if (existingRoom) {
        console.log('Room already exists:', roomId);
        return;
      }
      
      let code = undefined;
      if (isPrivate) {
        // Generate a unique code for the private room
        let unique = false;
        while (!unique) {
          code = generateRoomCode();
          const existing = await Room.findOne({ code });
          if (!existing) unique = true;
        }
      }
      const roomData = {
        id: roomId,
        title,
        description,
        category,
        type,
        isPrivate,
        code,
        createdBy: username,
        participants: [username]
      };
      const room = new Room(roomData);
      await room.save();
      socket.join(roomId);
      // Convert Map objects to plain objects for Socket.IO serialization
      const roomDataForSocket = serializeRoomForSocket(room);
      socket.emit('roomCreated', roomDataForSocket);
      // If private, also send the code
      if (isPrivate && code) {
        socket.emit('privateRoomCode', { code });
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  });

  // Join room by code
  socket.on('joinRoomByCode', async ({ code }) => {
    try {
      if (!code) return;
      const room = await Room.findOne({ code, isPrivate: true });
      if (!room) {
        return socket.emit('joinRoomByCodeError', { message: 'Invalid or expired room code.' });
      }
      if (!room.participants.includes(username)) {
        room.participants.push(username);
        await room.save();
      }
      socket.join(room.id);
      socket.to(room.id).emit('userJoined', { username, roomId: room.id });
      // Send room info to the joining user
      const roomData = serializeRoomForSocket(room);
      socket.emit('roomJoined', roomData);
      
      // Emit room update to all clients with new isActive status
      io.emit('roomUpdated', roomData);
    } catch (error) {
      console.error('Error joining room by code:', error);
      socket.emit('joinRoomByCodeError', { message: 'Failed to join room.' });
    }
  });

  socket.on('joinRoom', async ({ roomId }) => {
    try {
      if (!roomId) {
        return socket.emit('joinRoomError', { message: 'Room ID is required' });
      }
      
      const room = await Room.findOne({ id: roomId });
      if (!room) {
        return socket.emit('joinRoomError', { message: 'Room not found. Please check the room ID and try again.' });
      }
      
      
      
      if (!room.participants.includes(username)) {
        room.participants.push(username);
        await room.save();
      }
      
      socket.join(roomId);
      socket.to(roomId).emit('userJoined', { username, roomId });
      
      // Send room info to the joining user
      const roomData = serializeRoomForSocket(room);
      socket.emit('roomJoined', roomData);
      
      // Emit room update to all clients with new isActive status
      io.emit('roomUpdated', roomData);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('joinRoomError', { message: 'Failed to join room. Please try again.' });
    }
  });

  socket.on('leaveRoom', async ({ roomId }) => {
    try {
      if (!roomId) return;
      
      const room = await Room.findOne({ id: roomId });
      if (room) {
        room.participants = room.participants.filter(p => p !== username);
        await room.save();
        
        // Emit room update to all clients with new isActive status
        const roomData = serializeRoomForSocket(room);
        io.emit('roomUpdated', roomData);
      }
      
      socket.leave(roomId);
      io.to(roomId).emit('userLeft', { username, roomId });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Watch Party Features
  socket.on('addVideo', async ({ roomId, videoUrl }) => {
    try {
      if (!roomId || !videoUrl) return;
      
      const room = await Room.findOne({ id: roomId });
      if (!room || room.type !== 'Watch Together') return;
      
      const videoEntry = {
        url: videoUrl,
        score: 0,
        addedBy: username
      };
      
      room.videoQueue.push(videoEntry);
      await room.save();
      
      io.to(roomId).emit('videoAdded', videoEntry);
    } catch (error) {
      console.error('Error adding video:', error);
    }
  });

  socket.on('voteVideo', async ({ roomId, videoIndex, voteType }) => {
    try {
      if (!roomId || videoIndex === undefined || !voteType) return;
      
      const room = await Room.findOne({ id: roomId });
      if (!room || room.type !== 'Watch Together') return;
      
      const video = room.videoQueue?.[videoIndex];
      if (video && typeof video.score === 'number') {
        video.score += voteType === 'up' ? 1 : -1;

        const originalTopVideoUrl = room.videoQueue.length > 0 ? [...room.videoQueue].sort((a,b) => (b?.score ?? 0) - (a?.score ?? 0))[0].url : null;
        
        // Re-sort the queue by score
        room.videoQueue.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
        
        const newTopVideoUrl = room.videoQueue.length > 0 ? room.videoQueue[0].url : null;

        // If the top video has changed, update the index and notify clients
        if (newTopVideoUrl && newTopVideoUrl !== originalTopVideoUrl) {
          room.currentVideoIndex = 0; // The new top video is now at index 0
          io.to(roomId).emit('changeVideo', { 
            newQueue: room.videoQueue, 
            newIndex: room.currentVideoIndex 
          });
        } else {
          // If the order didn't change, just update the scores
          io.to(roomId).emit('videoVoted', { newQueue: room.videoQueue });
        }
        
        await room.save();
      }
    } catch (error) {
      console.error('Error voting video:', error);
    }
  });

  // Admin-only video controls
  socket.on('videoPlayerControl', async ({ roomId, action, payload }) => {
    try {
      if (!roomId || !action) return;
      
      const room = await Room.findOne({ id: roomId });
      if (!room || room.type !== 'Watch Together') return;

      // Only allow the room creator to control the player
      if (room.createdBy !== username) {
        return socket.emit('control_error', { message: 'Only the host can control the video.' });
      }

      switch(action) {
        case 'PLAY':
          room.isPlaying = true;
          break;
        case 'PAUSE':
          room.isPlaying = false;
          break;
        case 'SEEK':
          room.lastSyncTime = payload.time;
          break;
        case 'CHANGE_VIDEO':
          room.currentVideoIndex = payload.index;
          break;
        default:
          return; // Ignore unknown actions
      }

      await room.save();

      // Broadcast the action to all clients in the room except the sender
      socket.to(roomId).emit('videoPlayerStateChanged', {
        action,
        payload,
        newState: {
          isPlaying: room.isPlaying,
          currentTime: room.lastSyncTime,
          currentIndex: room.currentVideoIndex
        }
      });

    } catch (error) {
      console.error('Video control error:', error);
    }
  });

  // Room Chat
  socket.on('roomMessage', ({ roomId, content }) => {
    if (!roomId || !content) return;
    io.to(roomId).emit('roomMessage', { username, content, timestamp: new Date() });
  });

  // Video Sync for Watch Party
  socket.on('videoSync', ({ roomId, currentTime, isPlaying }) => {
    if (!roomId) return;
    socket.to(roomId).emit('videoSync', { username, currentTime, isPlaying });
  });

  // Remove video from queue when finished
  socket.on('removeVideoFromQueue', async ({ roomId, videoIndex }) => {
    try {
      if (!roomId || videoIndex === undefined) return;
      const room = await Room.findOne({ id: roomId });
      if (!room || !Array.isArray(room.videoQueue) || room.videoQueue.length === 0) return;
      if (videoIndex < 0 || videoIndex >= room.videoQueue.length) return;
      room.videoQueue.splice(videoIndex, 1);
      // If the removed video was the current, reset currentVideoIndex
      if (room.currentVideoIndex >= room.videoQueue.length) {
        room.currentVideoIndex = 0;
      }
      await room.save();
      io.to(roomId).emit('changeVideo', { newQueue: room.videoQueue, newIndex: room.currentVideoIndex });
    } catch (error) {
      console.error('Error removing video from queue:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', username);
    delete activeUsers[socket.id];
    delete userSockets[username];

    // Remove user from all rooms they were in and emit updates
    try {
      const rooms = await Room.find({ participants: username });
      for (const room of rooms) {
        room.participants = room.participants.filter(p => p !== username);
        await room.save();
        
        // Emit room update to all clients with new isActive status
        const roomData = serializeRoomForSocket(room);
        io.emit('roomUpdated', roomData);
      }
    } catch (error) {
      console.error('Error updating rooms on disconnect:', error);
    }
    
    // Send offline status to friends
    const user = await User.findOne({ username });
    if (user && user.friends) {
      user.friends.forEach(friend => {
        const friendSocketId = userSockets[friend];
        if (friendSocketId) {
          console.log('Notifying friend:', friend, 'that', username, 'is offline');
          io.to(friendSocketId).emit('friendOffline', username);
        }
      });
    }
  });
});

server.listen(5001, () => {
  console.log('Server running on http://localhost:5000');
});