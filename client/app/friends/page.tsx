"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSidebar } from "@/components/ui/SidebarContext";

export default function FriendsPage() {
  const [tab, setTab] = useState<"all" | "online" | "requests" | "find">("all");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState("");
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [friends, setFriends] = useState<Array<{ username: string; isOnline?: boolean; [key: string]: any }>>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [addFriendUsername, setAddFriendUsername] = useState("");
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const router = useRouter();
  // Sidebar margin logic (from dashboard)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isCallPage = pathname.startsWith("/call/");
  const { collapsed } = useSidebar();
  const sidebarMargin = !isCallPage ? (collapsed ? "ml-20" : "ml-64") : "";

  // Fetch user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.username) setUser(data.user.username);
      });
  }, []);

  // Fetch friends and requests
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_UR}/api/friends/${user}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "/login";
          return Promise.reject("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        setFriends(data.friends || []);
        setRequests(data.friendRequests || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err !== "Unauthorized") {
          setError("Failed to load friends");
          setLoading(false);
        }
      });
  }, [user]);

  // Search users
  useEffect(() => {
    if (tab !== "find" || !search.trim() || !user) return;
    const token = localStorage.getItem("token");
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL ;
    fetch(`${backend}/api/users/search?q=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSearchResults(data || []))
      .catch(() => setSearchResults([]));
  }, [search, tab, user]);

  // In the 'find' tab user search effect, use userSearch instead of search
  useEffect(() => {
    if (tab !== "find" || !userSearch.trim() || !user) return;
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/search?q=${encodeURIComponent(userSearch)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSearchResults(data || []))
      .catch(() => setSearchResults([]));
  }, [userSearch, tab, user]);

  // After fetching friends and setting up the user, add this effect:
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    // Listen for friends coming online
    socket.on("friendOnline", (username: string) => {
      setFriends(prev => prev.map(f => f.username === username ? { ...f, isOnline: true } : f));
    });
    // Listen for friends going offline
    socket.on("friendOffline", (username: string) => {
      setFriends(prev => prev.map(f => f.username === username ? { ...f, isOnline: false } : f));
    });
    return () => {
      socket.off("friendOnline");
      socket.off("friendOffline");
    };
  }, [user]);

  const filteredFriends = friends.filter(f =>
    (tab === "all" || (tab === "online" && f.isOnline)) &&
    f.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  return (
    <div className={`flex min-h-screen cosmic-gradient relative overflow-hidden ${sidebarMargin}`}>
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
      <div className="flex-1 p-8 relative z-10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Friends</h1>
            <p className="text-gray-400">Manage your friends and connections</p>
          </div>
          <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[hsl(263_90%_65%)] to-[hsl(240_100%_70%)] text-white font-semibold">Add Friend</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/80 backdrop-blur-md text-white border-cosmic-purple/20">
              <DialogHeader>
                <DialogTitle>Add Friend by Username</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!addFriendUsername.trim()) return;
                  setAddFriendLoading(true);
                  const socket = getSocket();
                  if (!socket.connected) socket.connect();
                  socket.emit("sendFriendRequest", addFriendUsername.trim());
                  socket.once("friend_request_success", (data: any) => {
                    setNotification(data.message);
                    setAddFriendLoading(false);
                    setAddFriendOpen(false);
                    setAddFriendUsername("");
                  });
                  socket.once("friend_request_error", (data: any) => {
                    setNotification(data.message);
                    setAddFriendLoading(false);
                  });
                }}
                className="space-y-4"
              >
                <input
                  className="w-full p-2 rounded-lg bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-cosmic-purple outline-none transition"
                  placeholder="Enter username..."
                  value={addFriendUsername}
                  onChange={e => setAddFriendUsername(e.target.value)}
                  required
                />
                <DialogFooter>
                  <Button type="submit" className="w-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white font-semibold" disabled={addFriendLoading}>
                    {addFriendLoading ? "Sending..." : "Send Friend Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Notification */}
        {notification && (
          <div className="text-green-400 mb-4">{notification}</div>
        )}
        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {(tab === "all" || tab === "online") && (
            <input
              type="text"
              placeholder="Search friends..."
              className="bg-background/50 border border-cosmic-purple/30 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cosmic-purple w-72"
              value={friendSearch}
              onChange={e => setFriendSearch(e.target.value)}
            />
          )}
          {tab === "find" && (
            <input
              type="text"
              placeholder="Search by username..."
              className="bg-background/50 border border-cosmic-purple/30 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cosmic-purple w-72"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          )}
        </div>
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "all" ? "default" : "outline"} onClick={() => setTab("all")}>All Friends <span className="ml-2">({friends.length})</span></Button>
          <Button variant={tab === "requests" ? "default" : "outline"} onClick={() => setTab("requests")}>Requests <span className="ml-2">({requests.length})</span></Button>
        </div>
        {/* Content */}
        <div className={`bg-card/10 backdrop-blur-sm border-dashed border-2 border-cosmic-purple/60 rounded-2xl p-8 shadow-xl min-h-[300px] flex flex-col items-center justify-center w-full`}>
          {loading ? (
            <div className="text-foreground/70">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : tab === "requests" ? (
            requests.length === 0 ? (
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-4">📩</div>
                <div className="text-xl font-semibold mb-2">No pending requests</div>
                <div className="text-foreground/70 text-center max-w-md">
                  When someone sends you a friend request, it will appear here for you to accept or decline.
                </div>
              </div>
            ) : (
              <div className="w-full">
                {requests.map((req: any) => (
                  <div key={req} className="flex items-center justify-between bg-[#18122b] rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue text-center leading-10 font-bold text-white text-xl">
                        {req[0]?.toUpperCase?.() || "?"}
                      </span>
                      <div>
                        <div className="font-semibold">{req}</div>
                        <div className="text-xs text-gray-400">Friend Request</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-green-600 text-white font-semibold" onClick={() => {
                        const socket = getSocket();
                        if (!socket.connected) socket.connect();
                        socket.emit("acceptFriendRequest", req);
                        socket.once("friendRequestAccepted", (from: string) => {
                          setRequests(requests.filter((r: any) => r !== req));
                          setNotification(`You are now friends with ${from}`);
                        });
                      }}>
                        Accept
                      </Button>
                      <Button className="bg-gray-700 text-white font-semibold" onClick={() => {
                        const socket = getSocket();
                        if (!socket.connected) socket.connect();
                        socket.emit("rejectFriendRequest", req);
                        setRequests(requests.filter((r: any) => r !== req));
                        setNotification(`Declined friend request from ${req}`);
                      }}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "all" ? (
            filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-12">
                <div className="text-5xl mb-4">🪐</div>
                <div className="text-xl font-semibold mb-2 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">No friends found</div>
                <div className="text-foreground/70 text-center max-w-md">
                  {/* {tab === 'online' */}
                    {/* ? 'None of your friends are online right now. Invite more cosmic companions or check back later!' */}
                    {/* : 'You have not added any friends yet. Use the "Find Friends" tab to start building your cosmic network!' */}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {filteredFriends.map(friend => (
                  <div key={friend.username}
                    className={`bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center transition-all duration-200
                      ${friend.isOnline ? 'ring-2 ring-green-400' : ''}
                    `}
                  >
                    <span className="inline-block h-16 w-16 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue text-center leading-[64px] font-bold text-white text-2xl mb-4 shadow-lg ring-2 ring-cosmic-purple/40">
                      {friend.username[0].toUpperCase()}
                    </span>
                    <div className="font-semibold text-lg mb-1 text-foreground">{friend.username}</div>
                    <div className={`text-xs flex items-center gap-1 mb-2 ${friend.isOnline ? 'text-green-400' : 'text-foreground/70'}`}> 
                      <span className={`inline-block h-2 w-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {friend.isOnline ? 'Online' : 'Offline'}
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        className={`cursor-pointer flex-1 bg-gradient-to-r from-[hsl(263_90%_65%)] to-[hsl(240_100%_70%)] text-white font-semibold ml-2
                          `}
                      
                        onClick={() => {
                          
                            router.push(`/chat?user=${encodeURIComponent(friend.username)}`);
                          
                        }}
                      >
                        Start Messaging
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "find" ? (
            searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-12">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-xl font-semibold mb-2 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">No users found</div>
                <div className="text-foreground/70 text-center max-w-md">
                  Try searching for a different username or invite your friends to join!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((user: any) => (
                  <div key={user.username} className="bg-[#18122b] rounded-xl p-6 shadow-lg flex flex-col items-start">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="inline-block h-12 w-12 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue text-center leading-[48px] font-bold text-white text-2xl">
                        {user.username[0].toUpperCase()}
                      </span>
                      <div>
                        <div className="font-semibold text-lg">{user.username}</div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white font-semibold"
                      onClick={() => {
                        const socket = getSocket();
                        if (!socket.connected) socket.connect();
                        socket.emit("sendFriendRequest", user.username);
                        socket.once("friend_request_success", (data: any) => {
                          setSentRequests([...sentRequests, user.username]);
                          setNotification(data.message);
                        });
                        socket.once("friend_request_error", (data: any) => {
                          setNotification(data.message);
                        });
                      }}
                      disabled={sentRequests.includes(user.username)}
                    >
                      {sentRequests.includes(user.username) ? "Request Sent" : "Add Friend"}
                    </Button>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
