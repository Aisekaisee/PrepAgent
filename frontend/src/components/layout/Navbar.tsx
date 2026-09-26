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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-all duration-200"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>PrepAgent AI Engine</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 font-bold">Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-all duration-200 cursor-pointer">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-white text-[10px] font-mono border border-slate-200 text-slate-700">
            Ctrl+K
          </kbd>
          <span>to ask coach</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-2.5 px-2 rounded-lg transition-colors ${
                      item.unread ? "bg-slate-50 font-medium" : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
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
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Avatar
              fallback={user?.email ? user.email.slice(0, 2).toUpperCase() : "PA"}
              className="h-8 w-8 bg-slate-900 text-white font-bold"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.email ? user.email.split("@")[0] : "Student"}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {user?.role || "student"}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-200 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-slate-300 bg-slate-100 text-slate-800"
                  >
                    {user?.role}
                  </Badge>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all duration-200"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all duration-200 text-left cursor-pointer"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    Switch to {user?.role === "admin" ? "Student" : "Admin"} Demo
                  </span>
                </button>

                <div className="border-t border-slate-200 my-1" />

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all duration-200 text-left cursor-pointer"
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
