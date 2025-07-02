"use client";
import { createContext, useContext, useState } from "react";

type SetCollapsed = ((v: boolean) => void) & ((fn: (prev: boolean) => boolean) => void);

const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: SetCollapsed;
}>({ collapsed: false, setCollapsed: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  // Allow setCollapsed to accept a function or a boolean
  const setCollapsed: SetCollapsed = (vOrFn: any) => {
    if (typeof vOrFn === "function") {
      setCollapsedState((prev) => vOrFn(prev));
    } else {
      setCollapsedState(vOrFn);
    }
  };
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
} 