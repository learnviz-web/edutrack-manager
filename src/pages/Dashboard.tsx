/**
 * Dashboard Page
 * Shows overview statistics and quick actions
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, ClipboardList, TrendingUp, Plus, ArrowRight } from 'lucide-react';

// Stat card component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  color: 'primary' | 'accent' | 'success' | 'warning';
}

function StatCard({ title, value, icon: Icon, description, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all stats in parallel
        const [studentsRes, activeStudentsRes, coursesRes, enrollmentsRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalStudents: studentsRes.count || 0,
          activeStudents: activeStudentsRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalEnrollments: enrollmentsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="content-container">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your student management system
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            description="Registered students"
            color="primary"
          />
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={TrendingUp}
            description="Currently enrolled"
            color="success"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            description="Available courses"
            color="accent"
          />
          <StatCard
            title="Enrollments"
            value={stats.totalEnrollments}
            icon={ClipboardList}
            description="Course enrollments"
            color="warning"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/students">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Student
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Course
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/enrollments">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Enrollment
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">System Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Database Status</span>
                  <span className="badge-status badge-active">Connected</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Authentication</span>
                  <span className="badge-status badge-active">Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
