"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Create Sidebar Context
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div
          className={`transition-all duration-200 ${
            isCollapsed ? "md:pl-16" : "md:pl-64"
          }`}
        >
          <main className="p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
