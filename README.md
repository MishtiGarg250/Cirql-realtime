# CIRQL - Real-Time Social Video Platform

A modern, feature-rich real-time social platform built with Next.js 15, TypeScript, and Socket.IO. Experience collaborative watchings, direct messaging, and social networking all in one place.


## ✨ Features

### 🏠 **Dashboard & Navigation**
- **Modern UI**: Beautiful cosmic-themed design with gradient animations
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Real-time Status**: Live friend online/offline indicators
- **Quick Actions**: One-click access to create rooms, find friends, and start chats
- **Collapsible Sidebar**: Space-efficient navigation with smooth animations

### 👥 **Social Features**
- **Friend System**: Send and accept friend requests with real-time notifications
- **Direct Messaging**: Private conversations with message history and emoji support
- **User Profiles**: Customizable profiles with avatar uploads
- **Online Status**: Real-time friend status updates
- **Friend Discovery**: Search and find new friends by username

### 📺 **Watch Party Rooms**
- **YouTube Integration**: Add YouTube videos to collaborative queue
- **Video Voting**: Upvote/downvote system to prioritize content
- **Synchronized Playback**: All participants watch the same video simultaneously
- **Queue Management**: Navigate through video playlist with controls
- **Real-time Chat**: Discuss videos while watching together

### 🔔 **Real-time Notifications**
- **Friend Requests**: Instant notifications for incoming requests
- **Message Alerts**: Real-time message notifications
- **Room Activity**: Updates on room joins, leaves, and activity
- **Status Changes**: Live friend online/offline status updates

## 🏗️ Architecture

### **Frontend Stack**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4.0 with custom cosmic theme
- **UI Components**: Radix UI primitives with custom styling
- **Real-time**: Socket.IO client for live communication
- **State Management**: React hooks with local state
- **Icons**: Lucide React for consistent iconography

### **Backend Stack**
- **Runtime**: Node.js with Express.js
- **Real-time**: Socket.IO server for live features
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based token system with bcrypt
- **File Upload**: Multer for profile picture uploads
- **Validation**: Input validation and sanitization

### **Database Schema**
```typescript
// User Model
interface User {
  username: string;           // Unique username
  email: string;             // Unique email
  password: string;          // Hashed password
  profilePic?: string;       // Profile picture URL
  friends: string[];         // Array of friend usernames
  friendRequests: string[];  // Pending friend requests
  createdAt: Date;
}

// Message Model
interface Message {
  sender: string;            // Sender username
  receiver: string;          // Receiver username
  content: string;           // Message content
  timestamp: Date;           // Message timestamp
}

// Room Model
interface Room {
  id: string;                // Unique room ID
  title: string;             // Room title
  description?: string;      // Room description
  category?: string;         // Room category
  type: 'Watch Together';    // Room type
  isPrivate: boolean;        // Privacy setting
  code?: string;             // Private room code
  createdBy: string;         // Creator username
  participants: string[];    // Current participants
  videoQueue: VideoEntry[];  // Video queue for watch parties
  currentVideoIndex: number; // Current video index
  isPlaying: boolean;        // Playback status
  lastSyncTime: number;      // Last sync timestamp
  createdAt: Date;
}

interface VideoEntry {
  url: string;               // YouTube URL
  score: number;             // Vote score
  addedBy: string;           // Added by username
}
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mishti.chat
```

2. **Install dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**

Create `.env` file in the backend directory:
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/mishti-chat
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
```

Create `.env.local` file in the frontend directory:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

4. **Start the servers**
```bash
# Terminal 1 - Backend (Port 5001)
cd backend
npm run dev

# Terminal 2 - Frontend (Port 3000)
cd frontend
npm run dev
```

5. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📱 Usage Guide

### **Getting Started**
1. **Sign Up**: Create an account with username, email, and password
2. **Login**: Access your account with credentials
3. **Add Friends**: Send friend requests to other users
4. **Start Chatting**: Click on friends to begin direct messaging

### **Creating Rooms**
1. **Navigate to Rooms**: Click "Create Room" from dashboard
2. **Choose Room Type**: Select "Watch Together" for collaborative video watching
3. **Set Room Details**: 
   - Title and description
   - Category (optional)
   - Privacy settings (public/private)
4. **Create Room**: Click "Create Room" to generate a new room

### **Joining Rooms**
1. **Browse Available Rooms**: See all public rooms on the dashboard
2. **Join Room**: Click "Join Room" to enter
3. **Private Rooms**: Use room codes to join private rooms
4. **Participate**: Use room-specific features based on type

### **Watch Party Features**
- **Add Videos**: Paste YouTube URLs to add to the queue
- **Vote System**: Upvote/downvote videos to prioritize the queue
- **Synchronized Playback**: All participants watch the same video
- **Queue Navigation**: Use Previous/Next buttons to change videos
- **Real-time Chat**: Discuss videos with other participants

### **Direct Messaging**
- **Friend List**: View all your friends with online status
- **Message History**: Persistent chat history with friends
- **Emoji Support**: Use emoji picker for expressive messages
- **Real-time Updates**: Instant message delivery and read status

## 🔧 API Endpoints

### **Authentication**
```http
POST /api/signup
POST /api/login
POST /api/verify
POST /api/profile-pic
```

### **Friends & Social**
```http
GET /api/friends/:username
GET /api/users/search?q=:query
GET /api/users/:username
```

### **Messages**
```http
GET /api/messages/:username1/:username2
```

### **Rooms**
```http
GET /api/rooms
```

### **Socket Events**
```typescript
// Room Events
'joinRoom'           // Join a room
'leaveRoom'          // Leave a room
'roomMessage'        // Send room chat message
'roomCreated'        // New room created
'roomUpdated'        // Room updated
'userJoined'         // User joined room
'userLeft'           // User left room

// Video Events (Watch Parties)
'addVideo'           // Add video to queue
'voteVideo'          // Vote on video
'changeVideo'        // Change current video
'videoPlayerStateChanged' // Video player state update

// Messaging Events
'sendDirectMessage'  // Send private message
'directMessage'      // Receive private message

// Friend Events
'sendFriendRequest'  // Send friend request
'acceptFriendRequest' // Accept friend request
'rejectFriendRequest' // Reject friend request
'friendRequest'      // Receive friend request
'friendRequestAccepted' // Friend request accepted

// Status Events
'online'             // User came online
'friendOnline'       // Friend came online
'friendOffline'      // Friend went offline
```

## 🛠️ Development

### **Project Structure**
```
mishti.chat/
├── frontend/                    # Next.js 15 frontend
│   ├── app/                    # App Router pages
│   │   ├── chat/              # Direct messaging
│   │   ├── dashboard/         # Main dashboard
│   │   ├── friends/           # Friend management
│   │   ├── rooms/             # Room management
│   │   ├── signup/            # Authentication
│   │   └── call/[id]/         # Watch party rooms
│   ├── components/            # React components
│   │   ├── ui/               # Radix UI components
│   │   ├── friends/          # Friend-related components
│   │   ├── rooms/            # Room-related components
│   │   └── dashboard/        # Dashboard components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── public/               # Static assets
├── backend/                   # Express.js backend
│   ├── src/
│   │   └── index.ts          # Main server file
│   ├── uploads/              # File uploads
│   └── package.json
└── README.md
```

### **Key Technologies**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.0
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose
- **Real-time**: Socket.IO for live communication
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for profile picture uploads
- **UI Components**: Radix UI primitives with custom styling

### **Development Scripts**
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run build        # Build TypeScript
```

### **Environment Variables**
```bash
# Production Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cirql
JWT_SECRET=your-production-jwt-secret
PORT=5001
NODE_ENV=production

# Production Frontend
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com


*Connect, collaborate, and create amazing experiences together!* 