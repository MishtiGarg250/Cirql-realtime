"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Clock, TrendingUp, Plus, ArrowRight, Search, MessageCircle, Copy, Filter } from "lucide-react";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import JoinRoomDialog from "@/components/JoinRoomDialog";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/SidebarContext";
import { getSocket } from "@/lib/socket";

// Room type matching your backend schema
interface Room {
  id: string;
  title: string;
  description?: string;
  category?: string;
  type: string;
  isPrivate: boolean;
  participants?: string[];
  createdBy?: string;
  createdAt?: string;
}
interface Friend {
  id: string;
  username: string;
  status: string;
  lastSeen: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function Dashboard() {
  const [username, setUsername] = useState<string>("");
  const [stats, setStats] = useState({
    myRooms: 0,
    activeRooms: 0,
    totalFriends: 0,
    onlineNow: 0,
  });
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pathname = usePathname();
  const isCallPage = pathname.startsWith("/call/");
  const { collapsed } = useSidebar();
  const sidebarMargin = !isCallPage ? (collapsed ? "ml-20" : "ml-64") : "";

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "User");
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username") || "User";
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json())
    ])
      .then(([roomsData, friendsData]) => {
        if (!Array.isArray(roomsData)) throw new Error("Invalid response");
        const myRooms = roomsData.filter((r: Room) => r.createdBy === user);
        setRecentRooms(myRooms.slice(0, 3));
        const friends = friendsData.friends || [];
        setStats({
          myRooms: myRooms.length,
          activeRooms: myRooms.filter((r: Room) => r.participants && r.participants.length > 0).length,
          totalFriends: friends.length,
          onlineNow: friends.filter((f: any) => f.isOnline).length,
        });
        setOnlineFriends(friends);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    // Listen for friends coming online
    socket.on("friendOnline", (username: string) => {
      setOnlineFriends(prev => prev.map(f => f.username === username ? { ...f, isOnline: true } : f));
    });
    // Listen for friends going offline
    socket.on("friendOffline", (username: string) => {
      setOnlineFriends(prev => prev.map(f => f.username === username ? { ...f, isOnline: false } : f));
    });
    return () => {
      socket.off("friendOnline");
      socket.off("friendOffline");
    };
  }, []);

  if (loading) return <div className="flex min-h-screen cosmic-gradient"><Sidebar /><div className="flex-1 flex items-center justify-center text-white">Loading...</div></div>;
  if (error) return <div className="flex min-h-screen cosmic-gradient"><Sidebar /><div className="flex-1 flex items-center justify-center text-red-400">{error}</div></div>;

  return (
    <div className={`flex min-h-screen cosmic-gradient ${sidebarMargin} relative overflow-hidden`}>
      {/* Animated Stars Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-star-glow rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <Sidebar />
      <div className="flex-1 p-8 relative z-10">
        {/* Welcome Header */}
        <h1 className="text-3xl font-bold mb-2 aurora-gradient-text">
          Welcome back, {username}!
        </h1>
        <p className="text-lg text-foreground/80 mb-8">
          Ready to connect and collaborate? Choose your next adventure below.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Join Room (left on desktop) */}
          <div className="bg-card/10 backdrop-blur-sm border-dashed border-2 border-cosmic-purple/60 rounded-2xl p-6 shadow-xl flex flex-col items-center hover:shadow-cosmic-purple/30 transition-shadow order-2 md:order-1">
            <div className="bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  rounded-full p-4 mb-4">
              <Search className="h-8 w-8 text-cosmic-purple" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Join Room</h2>
            <p className="text-foreground/70 mb-4 text-center">Use a room ID to join an existing watch party.</p>
            <JoinRoomDialog />
          </div>
          {/* Create Room (center on desktop) */}
          <div className="bg-card/10 backdrop-blur-sm border-dashed border-2 border-cosmic-purple/60 rounded-2xl p-6 shadow-xl flex flex-col items-center hover:shadow-cosmic-purple/30 transition-shadow order-1 md:order-2">
            <div className="bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  rounded-full p-4 mb-4">
              <Plus className="h-8 w-8 text-cosmic-purple" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Create Room</h2>
            <p className="text-foreground/70 mb-4 text-center">Invite friends. Watch together. Chat in real time.</p>
            <CreateRoomDialog />
          </div>
          {/* Chat (right on desktop) */}
          <div className="bg-transparent backdrop-blur-sm border-dashed border-2 border-cosmic-purple/60 rounded-2xl p-6 shadow-xl flex flex-col items-center hover:shadow-cosmic-purple/30 transition-shadow order-3 md:order-3">
            <div className="bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  rounded-full p-4 mb-4">
              <MessageCircle className="h-8 w-8 text-cosmic-purple" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Chat</h2>
            <p className="text-foreground/70 mb-4 text-center">Make friends and chat with them in real time.</p>
            <Link href="/chat"><Button className="w-full bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  text-white font-semibold">Open Chat</Button></Link>
          </div>
        </div>

        {/* Activity Overview - Cosmic Themed */}
        <div className="bg-card/10 backdrop-blur-md border border-cosmic-purple/30 rounded-2xl p-8 shadow-xl mb-10">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Your Cosmic Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center bg-card/20 rounded-xl p-6 border border-cosmic-purple/20 shadow-cosmic-purple/10 shadow-md">
              <Plus className="h-8 w-8 text-cosmic-purple mb-2" />
              <div className="text-4xl font-extrabold aurora-gradient-text mb-1">{stats.myRooms}</div>
              <div className="text-foreground/80 font-medium">My Rooms</div>
            </div>
            <div className="flex flex-col items-center bg-card/20 rounded-xl p-6 border border-cosmic-blue/20 shadow-cosmic-blue/10 shadow-md">
              <TrendingUp className="h-8 w-8 text-cosmic-blue mb-2" />
              <div className="text-4xl font-extrabold aurora-gradient-text mb-1">{stats.activeRooms}</div>
              <div className="text-foreground/80 font-medium">Active Rooms</div>
            </div>
            <div className="flex flex-col items-center bg-card/20 rounded-xl p-6 border border-cosmic-pink/20 shadow-cosmic-pink/10 shadow-md">
              <Users className="h-8 w-8 text-cosmic-pink mb-2" />
              <div className="text-4xl font-extrabold aurora-gradient-text mb-1">{stats.totalFriends}</div>
              <div className="text-foreground/80 font-medium">Total Friends</div>
            </div>
            <div className="flex flex-col items-center bg-card/20 rounded-xl p-6 border border-cosmic-green/20 shadow-cosmic-green/10 shadow-md">
              <UserPlus className="h-8 w-8 text-green-400 mb-2" />
              <div className="text-4xl font-extrabold aurora-gradient-text mb-1">{stats.onlineNow}</div>
              <div className="text-foreground/80 font-medium">Online Now</div>
            </div>
          </div>
        </div>

        <div className="bg-transparent grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Rooms */}
          <Card className="bg-transparent lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Rooms</CardTitle>
                <CardDescription>Rooms you have created</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/rooms">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 hover:cursor-pointer hover:shadow-cosmic-purple/10 hover:shadow-md hover:shadow-cosmic-purple/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{room.title}</h4>
                      <Badge variant={room.isPrivate ? "secondary" : "default"}>
                        {room.isPrivate ? "Private" : "Public"}
                      </Badge>
                      <Badge variant="outline">{room.type}</Badge>
                      {room.category && <Badge variant="outline">{room.category}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                    {room.participants && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {room.participants.length} participant{room.participants.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" className="hover:bg-secondary/10" size="sm">
                    Join
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Online Friends */}
          <Card className="bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Online Friends</CardTitle>
                <CardDescription>{onlineFriends.filter(f => f.isOnline).length} online</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/friends">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {onlineFriends.filter(friend => friend.isOnline).map((friend) => (
                <div key={friend.username} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>
                        {friend.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{friend.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">Online</p>
                  </div>
                </div>
              ))}
              {onlineFriends.filter(friend => friend.isOnline).length === 0 && (
                <div className="text-gray-400">No friends online.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}