import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Users,
  MessageCircle,
  Play,
  Star,
  Orbit,
  Video,
  UserPlus,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Index() {
  return (
    <div className="min-h-screen cosmic-gradient relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
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
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Orbit className="w-8 h-8" style={{ color: 'hsl(263, 90%, 65%)' }} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cosmic-pink rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
            cirql
          </span>
        </div>

        

        <div className="flex items-center space-x-4">
          <Link href="/login">
          <Button
            
            className="text-cosmic-purple hover:text-cosmic-purple"
          >
            Sign In
          </Button>
          </Link>
          <Link href="/signup">
          <Button className="bg-cosmic-purple hover:bg-cosmic-purple/90 text-white">
            Join the Galaxy
          </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center space-y-8">
          {/* Hero Badge */}
          <Badge className="bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30 px-6 py-2 text-sm font-medium">
            <Zap className="w-4 h-4 mr-2" />
            Real-time Social Video Watching
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
              Sync, Chat, Watch
            </span>
            <br />
            <span className="text-foreground">Together</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Where chats turn into watch parties. Create rooms, orbit your
            friends, and experience YouTube like never before in the cosmic
            social universe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
            <Button
              size="lg"
              className="bg-cosmic-purple hover:bg-cosmic-purple/90 text-white px-8 py-6 text-lg font-semibold group relative overflow-hidden"
            >
              <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
              Launch Your First Room
              <div className="absolute inset-0 bg-aurora-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
            </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-cosmic-purple/50 text-cosmic-purple hover:bg-cosmic-purple/10 px-8 py-6 text-lg"
            >
              <Play className="w-6 h-6 mr-3" />
              Watch Demo
            </Button>
          </div>

          

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 animate-float">
          <div className="w-12 h-12 bg-cosmic-purple-20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-cosmic-purple" />
          </div>
        </div>

        <div
          className="absolute top-1/3 right-16 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-10 h-10 bg-cosmic-blue-20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-cosmic-blue" />
          </div>
        </div>

        <div
          className="absolute bottom-1/4 left-1/4 animate-float"
          style={{ animationDelay: "4s" }}
        >
          <div className="w-8 h-8 bg-cosmic-pink-20 rounded-full flex items-center justify-center">
            <Video className="w-4 h-4 text-cosmic-pink" />
          </div>
        </div>
      </div>
    </main>

    {/* Features Section */}
    <section
      id="features"
      className="relative z-10 py-12 bg-card/5 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
              Expand Your
            </span>
            {" "}
            Social Universe
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Connect with friends across the galaxy and share experiences in
            real-time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl bg-card/10 backdrop-blur-sm border border-cosmic-purple/20 hover:border-cosmic-purple/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 bg-cosmic-purple/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cosmic-purple/30 transition-colors">
              <UserPlus className="w-8 h-8 text-cosmic-purple" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Orbit Friends
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              Send friend requests and build your cosmic network. Discover new
              connections and expand your social galaxy.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl bg-card/10 backdrop-blur-sm border border-cosmic-blue/20 hover:border-cosmic-blue/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 bg-cosmic-blue/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cosmic-blue/30 transition-colors">
              <MessageCircle className="w-8 h-8 text-cosmic-blue" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Real-time Chat
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              Chat instantly with friends in 1-on-1 conversations or group
              chats. Share reactions and thoughts in real-time.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl bg-card/10 backdrop-blur-sm border border-cosmic-pink/20 hover:border-cosmic-pink/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 bg-cosmic-pink/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cosmic-pink/30 transition-colors">
              <Video className="w-8 h-8 text-cosmic-pink" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Watch Parties
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              Create synchronized YouTube watch parties. Everyone stays in
              perfect sync while you chat and react together.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="relative z-10 py-24">
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="relative">
          {/* Decorative Stars */}
          <Star className="absolute -top-8 -left-8 w-6 h-6 text-cosmic-purple animate-twinkle" />
          <Star
            className="absolute -top-4 -right-12 w-4 h-4 text-cosmic-blue animate-twinkle"
            style={{ animationDelay: "1s" }}
          />
          <Star
            className="absolute -bottom-6 -left-16 w-5 h-5 text-cosmic-pink animate-twinkle"
            style={{ animationDelay: "2s" }}
          />

          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to join the
            <br />
            <span className="bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
              cosmic community?
            </span>
          </h2>

          <p className="text-xl text-foreground/80 mb-12 max-w-2xl mx-auto">
            Start your journey through the social universe. Create rooms, make
            friends, and experience entertainment like never before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              className="bg-cosmic-purple hover:bg-cosmic-purple/90 text-white px-12 py-6 text-xl font-semibold group relative overflow-hidden"
            >
              <Rocket className="w-7 h-7 mr-4 group-hover:animate-bounce" />
              Launch Into Space
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] opacity-0 group-hover:opacity-20 transition-opacity" />
            </Button>

            <div className="text-sm text-foreground/60">
              Free to join • No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 border-t border-cosmic-purple/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <Orbit className="w-8 h-8" style={{ color: 'hsl(263, 90%, 65%)' }} />
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(263_90%_65%)] via-[hsl(240_100%_70%)] to-[hsl(320_70%_70%)] bg-clip-text text-transparent">
              cirql
            </span>
          </div>

          <div className="flex items-center space-x-8 text-sm text-foreground/60">
            <a
              href="#"
              className="hover:text-cosmic-purple transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-cosmic-purple transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-cosmic-purple transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cosmic-purple/10 text-center text-sm text-foreground/50">
          © 2025 cirql. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
);
}
