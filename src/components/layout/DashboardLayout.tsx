/**
 * Dashboard Layout Component
 * Main layout wrapper with sidebar navigation
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation items for sidebar
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/enrollments', label: 'Enrollments', icon: ClipboardList },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
              <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Student MS</h2>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
            {/* Close button for mobile */}
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "sidebar-nav-item",
                    isActive ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent">
                <Users className="h-4 w-4 text-sidebar-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 bg-background border-b border-border lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">Student MS</span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
