"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Rocket, ArrowRight, Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onSuccess?: (token: string) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("token", data.token);
      if (onSuccess) onSuccess(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            className="pl-10 bg-background/50 border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10 bg-background/50 border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10 bg-background/50 border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && <div className="text-red-400 text-center">{error}</div>}
      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-cosmic-purple-20 hover:bg-cosmic-purple/90 text-white py-6 text-lg font-semibold group relative overflow-hidden"
        disabled={loading}
      >
        <Rocket className="w-5 h-5 mr-3 group-hover:animate-bounce" />
        {loading ? "Creating..." : "Create Account"}
        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-aurora-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
      </Button>
    </form>
  );
} 