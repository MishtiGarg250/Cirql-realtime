"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Rocket, ArrowRight, Eye, EyeOff ,Orbit} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(80)].map((_, i) => (
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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
            cirql
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-foreground/60">Don't have an account?</span>
          <Button
          
            className="text-cosmic-purple hover:text-cosmic-purple"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-120px)] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-cosmic-purple-20 rounded-full flex items-center justify-center animate-float">
              <Orbit className="w-10 h-10 text-cosmic-purple" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-foreground/70">
              Sign in to your account and continue your cosmic journey
            </p>
          </div>

          {/* Login Form */}
          <div className="p-8 rounded-2xl bg-card/10 backdrop-blur-sm border border-cosmic-purple/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email/Username Field */}
              <div className="space-y-2">
                <Label htmlFor="login" className="text-foreground">
                  Username 
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                  <Input
                    id="login"
                    name="login"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10 bg-background/50 border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20"
                    value={form.login}
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
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-background/50 border-cosmic-purple/30 focus:border-cosmic-purple focus:ring-cosmic-purple/20"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-aurora-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
              </Button>
            </form>

         

            
          </div>
        </div>
      </div>
    </div>
  );
} 