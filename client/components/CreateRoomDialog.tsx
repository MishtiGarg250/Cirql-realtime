"use client";
import { useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrl) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
}
const socket = io(backendUrl, {
  auth: { token: typeof window !== "undefined" ? localStorage.getItem("token") : "" },
  autoConnect: false,
});

export default function CreateRoomDialog({ onCreated }: { onCreated?: (room: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "Watch Together",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const roomId = uuidv4();
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }
    socket.emit(
      "createRoom",
      { roomId, ...form },
      (response: any) => {
        setLoading(false);
        if (response && response.error) {
          setError(response.error);
        } else {
          setSuccess("Room created!");
          setOpen(false);
          if (onCreated) onCreated(response);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[hsl(263_90%_65%)]  to-[hsl(240_100%_70%)]  text-white font-semibold">Create Room</Button>
      </DialogTrigger>
      <DialogContent className="bg-card/10 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl text-white">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent text-2xl font-bold">Create Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input className="w-full px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input className="w-full px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm" name="category" placeholder="Category" value={form.category} onChange={handleChange} />
          <select className="w-full px-4 py-2 rounded-xl bg-background/50 border border-cosmic-purple/30 text-foreground focus:outline-none focus:border-cosmic-purple transition shadow-sm backdrop-blur-sm" name="type" value={form.type} onChange={handleChange}>
            <option value="Watch Together">Watch Together</option>
          </select>
          <label className="flex items-center gap-2 text-foreground">
            <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} />
            Private Room
          </label>
          {error && <div className="text-red-400">{error}</div>}
          {success && <div className="text-green-400">{success}</div>}
          <DialogFooter className="flex gap-2 w-full">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-cosmic-purple to-cosmic-purple text-white font-semibold rounded-xl py-2" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button type="button" className="flex-1 bg-background/50 border border-cosmic-purple/30 text-foreground font-semibold rounded-xl py-2" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 