import { Suspense } from "react";
// ... existing imports
import ChatPage from "@/components/ChatPage";

function ChatPageContent() {
  // ... all your current ChatPage code (including useSearchParams)
}

export default function ChatContentPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPage />
    </Suspense>
  );
}