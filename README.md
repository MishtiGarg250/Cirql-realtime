# 🎮 Mishti.chat - Social Video Platform

A comprehensive real-time video chat and social platform with two distinct room types: Google Meet-style video meetings and collaborative YouTube watch parties.

## ✨ Features

### 🏠 **Dashboard**
- **Friend Management**: Send/accept friend requests, view friend list with online status
- **Direct Messaging**: Real-time chat with friends, message history persistence
- **Room Creation**: Create two types of rooms with custom settings
- **Room Discovery**: Browse and join available public rooms
- **Real-time Notifications**: Friend requests, messages, and room activity

### 🎥 **Video Meeting Rooms** (Google Meet Style)
- **Peer-to-Peer Video Calls**: WebRTC-based video/audio streaming
- **Screen Sharing**: Share your screen with participants
- **Participant List**: See who's in the room with real-time updates
- **Room Chat**: Real-time messaging during meetings
- **Host Controls**: Room creator has special privileges

### 📺 **Watch Party Rooms** (YouTube Sync)
- **Collaborative Video Watching**: Add YouTube videos to shared queue
- **Video Voting**: Upvote/downvote videos to prioritize the queue
- **Synchronized Playback**: All participants watch the same video
- **Queue Management**: Navigate through video playlist
- **Real-time Chat**: Discuss videos while watching

### 👥 **Social Features**
- **Friend System**: Add friends by username, manage friend requests
- **Direct Messaging**: Private conversations with message history
- **Online Status**: See when friends are online/offline
- **User Profiles**: Simple username-based profiles

## 🏗️ Architecture

### **Frontend** (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS for modern, responsive design
- **Real-time**: Socket.IO client for live communication
- **State Management**: React hooks for local state
- **Routing**: Next.js App Router with dynamic routes

### **Backend** (Node.js + Express + Socket.IO)
- **Server**: Express.js with Socket.IO for real-time features
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based token system
- **Caching**: Redis for notifications and session data
- **WebRTC**: Signaling server for peer-to-peer connections

### **Database Schema**
```javascript
// Users
{
  username: String (unique),
  friends: [String],
  friendRequests: [String],
  createdAt: Date
}

// Messages
{
  sender: String,
  receiver: String,
  content: String,
  timestamp: Date
}

// Rooms
{
  id: String (unique),
  title: String,
  description: String,
  category: String,
  type: 'meet' | 'watchparty',
  isPrivate: Boolean,
  createdBy: String,
  participants: [String],
  videoQueue: [{
    url: String,
    score: Number,
    addedBy: String
  }],
  createdAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Redis
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mishti.chat
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# WebRTC Server
cd ../webrtc-server
npm install
```

3. **Environment Setup**
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/mishti-chat
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WEBRTC_URL=http://localhost:7000
```

4. **Start the servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - WebRTC Server
cd webrtc-server
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- WebRTC Server: http://localhost:7000

## 📱 Usage Guide

### **Getting Started**
1. **Sign Up/Login**: Create an account with a username
2. **Add Friends**: Send friend requests to other users
3. **Start Chatting**: Click on friends to start direct messaging

### **Creating Rooms**
1. **Choose Room Type**:
   - **Video Meeting**: For face-to-face video calls
   - **Watch Party**: For collaborative YouTube watching
2. **Set Room Details**: Title, description, category, privacy
3. **Create Room**: Click "Create Room" to generate a new room

### **Joining Rooms**
1. **Browse Available Rooms**: See all public rooms on the dashboard
2. **Join Room**: Click "Join Room" to enter
3. **Participate**: Use room-specific features based on type

### **Video Meeting Features**
- **Start Video Call**: Click "Start Video Call" to enable camera/microphone
- **Screen Share**: Toggle screen sharing on/off
- **Chat**: Send messages to all participants
- **Leave Room**: Click "Leave Room" to exit

### **Watch Party Features**
- **Add Videos**: Paste YouTube URLs to add to the queue
- **Vote**: Upvote/downvote videos to prioritize
- **Navigate**: Use Previous/Next buttons to change videos
- **Chat**: Discuss videos with other participants

## 🔧 API Endpoints

### **Authentication**
- `POST /api/signup` - Create new user account
- `POST /api/login` - User login

### **Friends & Messages**
- `GET /api/friends/:username` - Get user's friends and requests
- `GET /api/messages/:username1/:username2` - Get chat history

### **Rooms**
- `GET /api/rooms` - Get all public rooms

### **Socket Events**
- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `roomMessage` - Send room chat message
- `sendDirectMessage` - Send private message
- `sendFriendRequest` - Send friend request
- `acceptFriendRequest` - Accept friend request
- `addVideo` - Add video to watch party queue
- `voteVideo` - Vote on video in queue
- `webrtcSignal` - WebRTC signaling for video calls

## 🛠️ Development

### **Project Structure**
```
mishti.chat/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   └── package.json
├── backend/                 # Express.js backend
│   ├── src/
│   │   └── index.ts        # Main server file
│   └── package.json
├── webrtc-server/          # WebRTC signaling server
│   └── index.ts
└── README.md
```

### **Key Technologies**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Redis
- **Real-time**: WebRTC, Socket.IO
- **Authentication**: JWT
- **Database**: MongoDB with Mongoose

## 🚀 Deployment

### **Environment Variables**
```bash
# Production Backend
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-production-secret
REDIS_URL=redis://your-redis-uri
NODE_ENV=production

# Production Frontend
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_WEBRTC_URL=https://your-webrtc-domain.com
```

### **Deployment Steps**
1. **Backend**: Deploy to Vercel, Railway, or any Node.js hosting
2. **Frontend**: Deploy to Vercel, Netlify, or any static hosting
3. **Database**: Use MongoDB Atlas for database
4. **Redis**: Use Redis Cloud or similar service
5. **WebRTC**: Deploy signaling server to support WebRTC connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ for the Mishti.chat community** 