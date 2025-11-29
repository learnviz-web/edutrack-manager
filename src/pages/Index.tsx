/**
 * Index Page - Landing/Welcome Page
 * Redirects authenticated users to dashboard
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, ClipboardList, ArrowRight } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Student Management
              <span className="block text-primary">System</span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
              A comprehensive solution for managing students, courses, and enrollments. 
              Built for administrators and faculty to streamline academic operations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="min-w-[200px] group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="stat-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Student Management</h3>
              <p className="text-sm text-muted-foreground">
                Complete CRUD operations for student records with search and pagination.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="stat-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Course Catalog</h3>
              <p className="text-sm text-muted-foreground">
                Manage courses with details like credits, capacity, and department.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="stat-card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 mb-4">
                <ClipboardList className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Enrollment Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track student enrollments, grades, and completion status.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            Student Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
