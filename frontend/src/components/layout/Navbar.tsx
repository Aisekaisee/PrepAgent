import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { user, logout, loginAsDemo } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock notifications for instant interactivity
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Milestone Reminder",
      message: "Week 2 Dynamic Programming review is pending.",
      time: "2h ago",
      unread: true,
    },
    {
      id: "2",
      title: "Reassessment Due",
      message: "Time for a 15-min check on Graph Algorithms.",
      time: "1d ago",
      unread: true,
    },
    {
      id: "3",
      title: "Roadmap Stale Notice",
      message: "Your target companies were updated. Regenerate your roadmap.",
      time: "2d ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>PrepAgent AI Engine</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut Placeholder */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs text-muted-foreground hover:border-border transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono border border-border/50">
            Ctrl+K
          </kbd>
          <span>to ask coach</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card p-4 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-border/40 max-h-72 overflow-y-auto my-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-2.5 px-1.5 rounded-lg transition-colors ${
                      item.unread ? "bg-primary/5" : "opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border/60 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  View all in Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-border/80 transition-all cursor-pointer"
          >
            <Avatar
              fallback={user?.email ? user.email.slice(0, 2).toUpperCase() : "PA"}
              className="h-8 w-8"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {user?.email ? user.email.split("@")[0] : "Student"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {user?.role || "student"}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 z-50">
              <div className="px-3 py-2 border-b border-border/60 mb-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant={user?.role === "admin" ? "purple" : "default"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {user?.role}
                  </Badge>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Link>

                {/* Role Switcher Demo Tool */}
                <button
                  onClick={() => {
                    const nextRole = user?.role === "admin" ? "student" : "admin";
                    loginAsDemo(nextRole);
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-left cursor-pointer"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
                  <span>
                    Switch to {user?.role === "admin" ? "Student" : "Admin"} Demo
                  </span>
                </button>

                <div className="border-t border-border/60 my-1" />

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
