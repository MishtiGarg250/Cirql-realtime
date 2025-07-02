"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Smile, ArrowLeft, X, Plus, MoreVertical } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface Friend {
  username: string;
  profilePic?: string;
  isOnline?: boolean;
}

interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function ChatPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<any>(null);
  const [user, setUser] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [friendSearch, setFriendSearch] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  // Fetch user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/api/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.username) setUser(data.user.username);
      });
  }, []);

  // Fetch friends
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;
    setLoadingFriends(true);
    fetch(`${BACKEND_URL}/api/friends/${user}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setFriends(data.friends || []);
        setLoadingFriends(false);
        if (data.friends && data.friends.length > 0) {
          setSelectedFriend(data.friends[0]);
        }
      })
      .catch(() => {
        setError("Failed to load friends");
        setLoadingFriends(false);
      });
  }, [user]);

  // Fetch messages for selected friend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user || !selectedFriend) return;
    setLoadingMessages(true);
    fetch(`${BACKEND_URL}/api/messages/${user}/${selectedFriend.username}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data || []);
        setLoadingMessages(false);
      })
      .catch(() => {
        setError("Failed to load messages");
        setLoadingMessages(false);
      });
  }, [selectedFriend, user]);

  // Socket setup for real-time messaging
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.auth = { token: localStorage.getItem("token") };
    if (!socket.connected) socket.connect();
    socketRef.current = socket;

    // Listen for incoming direct messages
    socket.on("directMessage", (msg: any) => {
      if (
        (msg.sender === selectedFriend?.username && msg.receiver === user) ||
        (msg.sender === user && msg.receiver === selectedFriend?.username)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off("directMessage");
    };
  }, [selectedFriend, user]);

  // After friends are loaded, select friend from query param if present
  useEffect(() => {
    if (friends.length > 0) {
      if (userParam) {
        const friend = friends.find(f => f.username === userParam);
        if (friend) setSelectedFriend(friend);
        else setSelectedFriend(friends[0]);
      } else {
        setSelectedFriend(friends[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, userParam]);

  // Filtered friends for sidebar
  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const handleSend = () => {
    if (!input.trim() || !selectedFriend || !user) return;
    const socket = socketRef.current;
    socket.emit("sendDirectMessage", {
      receiver: selectedFriend.username,
      content: input,
    });
    setMessages(prev => [
      ...prev,
      {
        sender: user,
        receiver: selectedFriend.username,
        content: input,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex min-h-screen cosmic-gradient relative overflow-hidden">
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
      
      <div className="flex-1 flex relative z-10">
        {/* Friends Sidebar */}
        <aside className="w-80 bg-card/20 backdrop-blur-md border-r border-cosmic-purple/20 flex flex-col rounded-l-2xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-cosmic-purple/20">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="group">
                <ArrowLeft className="h-6 w-6 text-cosmic-purple group-hover:-translate-x-1 transition-transform" />
              </Link>
              <span className="text-3xl font-bold aurora-gradient-text">Chats</span>
            </div>
          </div>
          <div className="px-4 py-2">
            <Input
              className="mb-2"
              placeholder="Search friends..."
              value={friendSearch}
              onChange={e => setFriendSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {loadingFriends ? (
              <div className="text-foreground/70 p-4">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-foreground/70 p-4">No friends found</div>
            ) : (
              filteredFriends.map(friend => (
                <div
                  key={friend.username}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer mb-1 transition-all duration-200 group
                    ${selectedFriend?.username === friend.username
                      ? "bg-cosmic-purple/20 border border-cosmic-purple/60 shadow-cosmic-purple/30 shadow-lg text-cosmic-purple"
                      : "hover:bg-cosmic-purple/10 hover:shadow-cosmic-purple/30 hover:shadow-lg border border-transparent"}
                  `}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-cosmic-pink to-cosmic-purple text-center leading-10 font-bold text-white text-xl shadow-lg ring-2 ring-cosmic-purple/40">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.username} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      friend.username[0].toUpperCase()
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{friend.username}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className={`inline-block h-2 w-2 rounded-full ${friend.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className={friend.isOnline ? "text-green-500" : "text-gray-400"}>{friend.isOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-card/20 backdrop-blur-md border-l border-cosmic-purple/20 rounded-r-2xl shadow-2xl">
          {/* Chat Header */}
          <header className="flex items-center gap-4 px-8 py-5 border-b border-cosmic-purple/20 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
            {selectedFriend && (
              <>
                <span className="inline-block h-12 w-12 rounded-full bg-gradient-to-br from-cosmic-pink to-cosmic-purple text-center leading-[3rem] font-bold text-white text-2xl shadow-lg ring-2 ring-cosmic-purple/40">
                  {selectedFriend.profilePic ? (
                    <img src={selectedFriend.profilePic} alt={selectedFriend.username} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    selectedFriend.username[0].toUpperCase()
                  )}
                </span>
                <div>
                  <div className="font-semibold text-lg text-foreground">{selectedFriend.username}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`inline-block h-2 w-2 rounded-full ${selectedFriend.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className={selectedFriend.isOnline ? "text-green-500" : "text-gray-400"}>{selectedFriend.isOnline ? "Online" : "Offline"}</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="icon" title="Friend actions">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </header>
          {/* Messages Area */}
          <section className="flex-1 flex flex-col items-stretch justify-end overflow-y-auto px-2 py-4 bg-gradient-to-b from-transparent to-black/10">
            {loadingMessages ? (
              <div className="text-foreground/70 flex-1 flex items-center justify-center">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gradient-to-r from-[hsl(263_90%_65%)] to-[hsl(240_100%_70%)] rounded-full p-6 mb-4">
                  <Smile className="h-10 w-10 text-white" />
                </div>
                <div className="text-xl font-semibold mb-2">No messages yet</div>
                <div className="text-foreground/70">Start the conversation!</div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col gap-2">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === user;
                  return (
                    <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <Card className={`px-3 py-2 rounded-2xl shadow-md text-sm md:text-base ${isMe ? "bg-secondary/10 text-white ml-auto" : "bg-secondary/80 text-white mr-auto"} relative`}>
                        <div className="whitespace-pre-line break-words">{msg.content}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          {/* Message Input */}
          <form
            className="flex items-end gap-2 px-8 py-4 border-t border-cosmic-purple/20 bg-card/30"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Emoji Picker Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="mb-1">
                  <Smile className="h-6 w-6 text-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 w-fit bg-background border-cosmic-purple/100" showCloseButton={true}>
                <EmojiPicker
                  theme={Theme.DARK}
                  width={340}
                  height={400}
                  onEmojiClick={(emoji: any) => {
                    setInput(input + emoji.emoji);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                />
              </DialogContent>
            </Dialog>
            <Input
              ref={inputRef}
              className="flex-1 min-h-[36px] max-h-32 resize-none text-base px-3 py-2"
              placeholder={selectedFriend ? `Message ${selectedFriend.username}...` : "Select a friend to chat..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!selectedFriend}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="submit" className="ml-2 bg-gradient-to-r from-[hsl(240_100%_70%)] to-[hsl(263_90%_65%)] text-white px-6 shadow-lg" disabled={!input.trim() || !selectedFriend}>
              Send
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
} 