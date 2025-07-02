"use client";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Filter, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/SidebarContext";
import CreateRoomDialog from "@/components/CreateRoomDialog";

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
  roomId?: string;
}

function formatTime(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "public" | "private">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Sidebar margin logic (from dashboard)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isCallPage = pathname.startsWith("/call/");
  const { collapsed } = useSidebar();
  const sidebarMargin = !isCallPage ? (collapsed ? "ml-20" : "ml-64") : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Invalid response");
        setRooms(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredRooms = rooms.filter(room => {
    if (filter === "active") return room.participants && room.participants.length > 0;
    if (filter === "public") return !room.isPrivate;
    if (filter === "private") return room.isPrivate;
    return true;
  }).filter(room =>
    (room.title?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (room.description?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (room.category?.toLowerCase().includes(search.toLowerCase()) || "")
  );

  if (loading) return <div className="flex min-h-screen cosmic-gradient"><Sidebar /><div className="flex-1 flex items-center justify-center text-white">Loading...</div></div>;
  if (error) return <div className="flex min-h-screen cosmic-gradient"><Sidebar /><div className="flex-1 flex items-center justify-center text-red-400">{error}</div></div>;

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
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">Rooms</h1>
            <p className="text-gray-400">Discover and join rooms that interest you</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic-purple">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"/></svg>
              </span>
              <input
                className="pl-10 pr-4 py-2 w-full rounded-xl bg-card/20 border border-cosmic-purple-20 text-white placeholder:text-cosmic-purple/60 focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm"
                placeholder="Search rooms by title, desc.."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
               <PlusIcon className="h-5 w-5" />
               <span className="ml-2 hidden md:inline">Create Room</span>
            </Button> */}
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All Rooms <span className="ml-2">({rooms.length})</span></Button>
          <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>Active <span className="ml-2">({rooms.filter(r => r.participants && r.participants.length > 0).length})</span></Button>
          <Button variant={filter === "public" ? "default" : "outline"} onClick={() => setFilter("public")}>Public <span className="ml-2">({rooms.filter(r => !r.isPrivate).length})</span></Button>
          <Button variant={filter === "private" ? "default" : "outline"} onClick={() => setFilter("private")}>Private <span className="ml-2">({rooms.filter(r => r.isPrivate).length})</span></Button>
        </div>
        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div key={room.id || room.roomId || Math.random()} className="bg-card/10 backdrop-blur-sm border-dashed border-2 border-cosmic-purple/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:shadow-cosmic-purple/30 transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-foreground">{room.title || "Untitled Room"}</h2>
                  <Badge variant="secondary">{room.type || "Room"}</Badge>
                </div>
                <p className="text-foreground/70 mb-2">{room.description || "No description provided."}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{room.category || "General"}</Badge>
                  <Badge variant={room.isPrivate ? "secondary" : "default"}>{room.isPrivate ? "Private" : "Public"}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Users className="h-4 w-4" />
                  {Array.isArray(room.participants) ? room.participants.length : 0} participants
                  <span className="ml-2">by {room.createdBy || "Unknown"}</span>
                  <span className="ml-2">{room.createdAt ? formatTime(room.createdAt) : "Unknown"}</span>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white font-semibold mt-4"
                onClick={() => router.push(`/call/${room.id || room.roomId}`)}
                disabled={!room.id && !room.roomId}
              >
                Join Room
              </Button>
            </div>
          ))}
        </div>
        {/* <CreateRoomDialog /> */}
      </div>
    </div>
  );
}