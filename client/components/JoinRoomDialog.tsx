"use client";
import { useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
  auth: { token: typeof window !== "undefined" ? localStorage.getItem("token") : "" },
  autoConnect: false,
});

export default function JoinRoomDialog({ onJoined }: { onJoined?: (room: any) => void }) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }
    if (roomId) {
      socket.emit("joinRoom", { roomId }, (response: any) => {
        setLoading(false);
        if (response && response.error) {
          setError(response.error);
        } else {
          setSuccess("Joined room!");
          setTimeout(() => setOpen(false), 1000);
          if (onJoined) onJoined(response);
        }
      });
    } else if (code) {
      socket.emit("joinRoomByCode", { code }, (response: any) => {
        setLoading(false);
        if (response && response.error) {
          setError(response.error);
        } else {
          setSuccess("Joined private room!");
          setTimeout(() => setOpen(false), 1000);
          if (onJoined) onJoined(response);
        }
      });
    } else {
      setLoading(false);
      setError("Please enter a Room ID.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button className="bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  text-white font-semibold">Join Room</Button>
      </DialogTrigger>
      <DialogContent className="bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl text-white">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent text-2xl font-bold">Join Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm" placeholder="Room ID (public)" value={roomId} onChange={e => setRoomId(e.target.value)} />
          
          {error && <div className="text-red-400">{error}</div>}
          {success && <div className="text-green-400">{success}</div>}
          <DialogFooter className="flex gap-2 w-full">
            <Link href={`/call/${roomId}`}>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-cosmic-purple to-cosmic-purple text-white font-semibold rounded-xl py-2" disabled={loading}>
              {loading ? "Joining..." : "Join"}
            </Button>
            </Link>
            <Button type="button" className="flex-1 bg-background/50 border border-cosmic-purple/30 text-foreground font-semibold rounded-xl py-2" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 