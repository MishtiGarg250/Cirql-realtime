"use client";
import { useRouter } from "next/navigation";
import SignupForm from "@/components/SignupForm";
import Link from "next/link";
import { Orbit } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center cosmic-gradient relative overflow-hidden">
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
      <div className="relative z-10 bg-card/10 backdrop-blur-sm border border-cosmic-purple/20 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        {/* Header with logo and title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-cosmic-purple-20 rounded-full flex items-center justify-center animate-float">
            <Orbit className="w-10 h-10 text-cosmic-purple" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
              Join the Galaxy
            </span>
          </h1>
          <p className="text-foreground/70">
            Create your account and join the cosmic community.
          </p>
        </div>
        <SignupForm onSuccess={() => router.push("/dashboard")} />
      </div>
      <p className="mt-4 text-center text-foreground/70 relative z-10">
        Already have an account?{' '}
        <Link href="/login" className="text-cosmic-purple hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
