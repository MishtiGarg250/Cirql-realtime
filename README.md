# CIRQL - Real-Time Social Video Platform

A modern real-time social platform for collaborative video watching, chat, and networking. Built with Next.js, TypeScript, and Socket.IO.

## Features
- Modern, responsive UI with cosmic theme
- Real-time chat and friend system
- Watch party rooms with YouTube sync and voting
- Direct messaging and notifications
- User profiles with avatars

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Socket.IO-client
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT Auth

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cirql
   ```
2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   # Frontend
   cd ../client
   npm install
   ```
3. **Environment Setup**
   - In `backend/.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/cirql
     JWT_SECRET=your-secret-key
     PORT=5001
     ```
   - In `client/.env.local`:
     ```env
     NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
     ```
4. **Start the servers**
   ```bash
   # Backend (port 5001)
   cd backend
   npm run dev
   # Frontend (port 3000)
   cd ../client
   npm run dev
   ```
5. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Usage
- **Sign Up/Login:** Create an account and log in
- **Add Friends:** Search and send friend requests
- **Chat:** Message friends in real time
- **Create/Join Rooms:** Start or join watch parties, add YouTube videos, chat, and vote

## Troubleshooting
- **Username not showing in sidebar?** Make sure your browser's localStorage is not blocked. After signup/login, the username is saved in localStorage and used for display.

## License
MIT

 
 
