"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, LogOut, Users, Video, MessageCircle, Check, ThumbsUp, ThumbsDown, Crown } from "lucide-react";
import { getSocket } from "@/lib/socket";
import YouTube from "react-youtube";

export default function CallPage() {
  const { id } = useParams();
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [host, setHost] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [user, setUser] = useState<string | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Join room and setup socket listeners
  useEffect(() => {
    const socket = getSocket();
    socket.auth = { token: localStorage.getItem("token") };
    if (!socket.connected) socket.connect();
    socketRef.current = socket;
    socket.emit("joinRoom", { roomId: id });
    socket.on("roomJoined", (roomData: any) => {
      setRoom(roomData);
      setHost(roomData.createdBy);
      setQueue(roomData.videoQueue || []);
      setCurrentVideo((roomData.videoQueue && roomData.videoQueue[0]) || null);
      setParticipants(
        (roomData.participants || []).map((username: string) => ({
          username,
          isHost: username === roomData.createdBy,
          online: true,
        }))
      );
    });
    socket.on("userJoined", ({ username }) => {
      setParticipants((prev) =>
        prev.some((p) => p.username === username)
          ? prev
          : [...prev, { username, isHost: username === host, online: true }]
      );
    });
    socket.on("userLeft", ({ username }) => {
      setParticipants((prev) => prev.filter((p) => p.username !== username));
    });
    socket.on("roomMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("videoAdded", (video: any) => {
      setQueue((prev) => [...prev, video]);
    });
    socket.on("videoVoted", ({ newQueue }) => {
      setQueue(newQueue);
      if (newQueue.length > 0) {
        setCurrentVideo(newQueue[0]);
      } else {
        setCurrentVideo(null);
      }
    });
    socket.on("changeVideo", ({ newQueue, newIndex }) => {
      setQueue(newQueue);
      setCurrentVideo(newQueue[newIndex]);
    });
    setUser(localStorage.getItem("username"));
    return () => {
      socket.off("roomJoined");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("roomMessage");
      socket.off("videoAdded");
      socket.off("videoVoted");
      socket.off("changeVideo");
    };
    // eslint-disable-next-line
  }, [id]);

  // Fetch titles for videos in the queue
  useEffect(() => {
    queue.forEach(video => {
      const videoId = extractYouTubeId(video.url);
      if (videoId && !titles[videoId]) {
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`)
          .then(res => res.json())
          .then(data => {
            if (data.items && data.items.length > 0) {
              setTitles(prev => ({ ...prev, [videoId]: data.items[0].snippet.title }));
            }
          });
      }
    });
    // eslint-disable-next-line
  }, [queue]);

  const handleSend = () => {
    if (!input.trim()) return;
    const socket = socketRef.current;
    socket.emit("roomMessage", { roomId: id, content: input });
    setInput("");
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    const socket = socketRef.current;
    socket.emit("addVideo", { roomId: id, videoUrl });
    setVideoUrl("");
  };

  const handleVote = (index: number, type: "up" | "down") => {
    const socket = socketRef.current;
    socket.emit("voteVideo", { roomId: id, videoIndex: index, voteType: type });
  };

  function extractYouTubeId(url: string) {
    // Handles: https://www.youtube.com/watch?v=VIDEO_ID
    //          https://youtu.be/VIDEO_ID
    //          https://www.youtube.com/embed/VIDEO_ID
    //          and strips extra params
    const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  let videoPlayer = null;
  if (currentVideo) {
    const videoId = extractYouTubeId(currentVideo.url);
    if (!videoId) {
      videoPlayer = (
        <div className="flex flex-col items-center justify-center min-h-[420px] bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl w-full max-w-4xl mx-auto my-8 shadow-xl">
          <Video className="h-20 w-20 text-cosmic-purple mb-4" />
          <div className="text-xl font-semibold text-red-400">Invalid YouTube URL</div>
        </div>
      );
    } else {
      videoPlayer = (
        <div className="flex justify-center items-center w-full my-8">
          <div className="relative w-full max-w-[900px] aspect-video rounded-2xl overflow-hidden bg-black mx-auto flex items-center justify-center">
            <YouTube videoId={videoId} className="w-full h-full" opts={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      );
    }
  } else {
    videoPlayer = (
      <div className="flex flex-col items-center justify-center min-h-[420px] bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl w-full max-w-4xl mx-auto my-8 shadow-xl">
        <Video className="h-20 w-20 text-cosmic-purple mb-4" />
        <div className="text-xl font-semibold">No video selected</div>
      </div>
    );
  }

  const uniqueParticipants = Array.from(
    new Map(participants.map(p => [p.username, p])).values()
  );

  return (
    <div className="min-h-screen cosmic-gradient text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-cosmic-purple/30 bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cosmic-purple to-cosmic-blue h-12 w-12 rounded-xl flex items-center justify-center text-2xl font-bold">
            <Video className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">{room?.title || "Call"}</div>
            <div className="text-xs text-gray-400">{room?.description || 'No description provided.'}</div>
          </div>
          <Badge variant="secondary" className="ml-4">{room?.type || "Call"}</Badge>
          <Badge variant="outline" className="ml-2">
            {participants.length} participants
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-cosmic-purple/30 text-cosmic-purple hover:bg-cosmic-purple/10 flex items-center"
            onClick={() => {
              navigator.clipboard.writeText(String(id));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            title="Copy Room ID"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied!" : "Copy Room ID"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const socket = socketRef.current;
              socket.emit("leaveRoom", { roomId: id });
              router.push("/rooms");
            }}
          >
            <LogOut className="h-4 w-4 mr-1" /> Leave
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Video/Call Area + Queue Side-by-Side */}
        <div className="flex-1 flex flex-col items-center justify-center bg-card/10 backdrop-blur-sm border-r border-cosmic-purple/20 rounded-l-2xl min-h-[calc(100vh-120px)] gap-8 p-6">
          <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
            {/* Video Player */}
            <div className="w-full mb-2">{videoPlayer}</div>
            <form
              className="flex gap-2 mb-6 w-full"
              onSubmit={e => {
                e.preventDefault();
                handleAddVideo();
              }}
            >
              <input
                className="flex-1 px-4 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-cosmic-purple/60 focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm"
                placeholder="Add YouTube URL..."
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                disabled={!user}
              />
              <Button type="submit" className="bg-gradient-to-r from-[hsl(240_100%_70%)] to-[hsl(263_90%_65%)] text-white font-semibold rounded-xl" disabled={!videoUrl.trim() || !user}>
                Add Video
              </Button>
            </form>
            {/* Queue Section with thumbnails */}
            <div className="bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-4 flex flex-col gap-4 shadow-xl w-full mt-4">
              <div className="text-lg font-bold mb-2 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Queue</div>
              {queue.length === 0 ? (
                <div className="text-foreground/70 text-center">No videos in queue</div>
              ) : (
                queue.map((video, idx) => {
                  const videoId = extractYouTubeId(video.url);
                  // Calculate score: use video.score if present, else upvotes - downvotes
                  let score = 0;
                  if (typeof video.score === 'number') {
                    score = video.score;
                  } else if (Array.isArray(video.upvotes) && Array.isArray(video.downvotes)) {
                    score = video.upvotes.length - video.downvotes.length;
                  }
                  return (
                    <div key={video.url || idx} className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${currentVideo && extractYouTubeId(currentVideo.url) === videoId ? 'bg-cosmic-purple/10 border border-cosmic-purple/60' : 'hover:bg-cosmic-purple/10'}`}>
                      {/* YouTube Thumbnail */}
                      {videoId && (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-16 h-10 rounded-md object-cover border border-cosmic-purple/30"
                        />
                      )}
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-foreground">{videoId ? titles[videoId] || video.url : video.url}</span>
                        <div className="text-xs text-foreground/70">Added by {video.addedBy}</div>
                      </div>
                      {/* Thumbs up/down and score */}
                      <Button size="icon" variant="ghost" className="text-green-500" onClick={() => handleVote(idx, 'up')} title="Thumbs Up">
                        <ThumbsUp className="h-5 w-5" />
                      </Button>
                      <span className="font-semibold w-6 text-center text-foreground">{score}</span>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleVote(idx, 'down')} title="Thumbs Down">
                        <ThumbsDown className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Add Video Form */}
            
          </div>
        </div>
        {/* Right Sidebar: Participants and Chat */}
        <div className="w-[350px] flex flex-col gap-6 p-4 bg-card/10 backdrop-blur-sm border-l border-cosmic-purple/20 rounded-r-2xl shadow-xl min-h-[calc(100vh-120px)] relative z-10">
          {/* Participants List */}
          <div className="bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-4 shadow flex flex-col gap-3">
            <div className="text-lg font-bold mb-2 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Participants</div>
            {uniqueParticipants.length === 0 ? (
              <div className="text-foreground/70 text-center">No participants</div>
            ) : (
              uniqueParticipants.map((p, idx) => (
                <div key={p.username} className="flex items-center gap-3 p-2 rounded-xl hover:bg-cosmic-purple/10 transition-all">
                  <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue text-center leading-10 font-bold text-white text-xl shadow ring-2 ring-cosmic-purple/40">
                    {p.username[0].toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-foreground flex items-center">
                      {p.isHost && <Crown className="h-4 w-4 mr-1 text-yellow-400 inline" />}
                      {p.username}
                    </span>
                    <div className={`text-xs flex items-center gap-1 ${p.online ? 'text-green-400' : 'text-foreground/70'}`}> 
                      <span className={`inline-block h-2 w-2 rounded-full ${p.online ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {p.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Chat Section */}
          <div className="flex-1 flex flex-col bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl shadow p-4">
            <div className="text-lg font-bold mb-2 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Chat</div>
            <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1">
              {messages.length === 0 ? (
                <div className="text-foreground/70 text-center">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg, idx) => {
                  const sender = msg.sender || msg.username;
                  const isMe = sender === user;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-xl mb-1 shadow-sm ${isMe ? 'bg-gradient-to-r from-[hsl(263_90%_65%)] to-[hsl(240_100%_70%)]' : 'bg-secondary/10 text-foreground border border-cosmic-purple/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-xs px-2 py-0.5 rounded ${isMe ? 'bg-cosmic-purple/80 text-white' : 'bg-cosmic-blue/80 text-white'}`}>{sender}</span>
                          {msg.timestamp && (
                            <span className="text-xs text-foreground/60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              className="flex gap-2 mt-2"
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                className="flex-1 px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-cosmic-purple/60 focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!user}
              />
              <Button type="submit" className="bg-gradient-to-r from-[hsl(240_100%_70%)] to-[hsl(263_90%_65%)] text-white font-semibold rounded-xl" disabled={!input.trim() || !user}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 