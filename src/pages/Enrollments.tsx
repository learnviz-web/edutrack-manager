/**
 * Enrollments Page
 * Manage student-course enrollments
 */

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
}

interface Course {
  id: string;
  course_code: string;
  title: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  grade: string | null;
  status: string;
  students: Student;
  courses: Course;
}

const ITEMS_PER_PAGE = 10;

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    grade: '',
    status: 'enrolled' as 'enrolled' | 'completed' | 'dropped',
  });

  const { toast } = useToast();

  // Fetch enrollments with student and course data
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get enrollments with joins
      const { data, count, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          students!inner(id, student_id, first_name, last_name),
          courses!inner(id, course_code, title)
        `, { count: 'exact' })
        .order('enrolled_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setEnrollments((data as any) || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Fetch students and courses for dropdowns
  const fetchOptions = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        supabase.from('students').select('id, student_id, first_name, last_name').eq('status', 'active').order('last_name'),
        supabase.from('courses').select('id, course_code, title').eq('status', 'active').order('course_code'),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
    } catch (error: any) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchOptions();
  }, [currentPage]);

  const resetForm = () => {
    setFormData({
      student_id: '',
      course_id: '',
      grade: '',
      status: 'enrolled',
    });
    setEditingEnrollment(null);
  };

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setFormData({
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      grade: enrollment.grade || '',
      status: enrollment.status as 'enrolled' | 'completed' | 'dropped',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.course_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a student and course' });
      return;
    }

    try {
      const enrollmentData = {
        student_id: formData.student_id,
        course_id: formData.course_id,
        grade: formData.grade || null,
        status: formData.status,
      };

      if (editingEnrollment) {
        const { error } = await supabase
          .from('enrollments')
          .update(enrollmentData)
          .eq('id', editingEnrollment.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Enrollment updated' });
      } else {
        const { error } = await supabase.from('enrollments').insert([enrollmentData]);
        if (error) {
          if (error.code === '23505') {
            toast({ variant: 'destructive', title: 'Error', description: 'Student is already enrolled in this course' });
            return;
          }
          throw error;
        }
        toast({ title: 'Success', description: 'Enrollment created' });
      }

      setDialogOpen(false);
      resetForm();
      fetchEnrollments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Enrollment deleted' });
      fetchEnrollments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="content-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enrollments</h1>
            <p className="text-muted-foreground">Manage student course enrollments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEnrollment ? 'Edit Enrollment' : 'Create Enrollment'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Student *</Label>
                  <Select 
                    value={formData.student_id} 
                    onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                    disabled={!!editingEnrollment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.student_id} - {s.first_name} {s.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Select 
                    value={formData.course_id} 
                    onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                    disabled={!!editingEnrollment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.course_code} - {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="A, B+, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingEnrollment ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No enrollments found</TableCell>
                </TableRow>
              ) : (
                enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.students.first_name} {enrollment.students.last_name}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.students.student_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.courses.title}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.courses.course_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                    <TableCell>{enrollment.grade || '-'}</TableCell>
                    <TableCell>
                      <span className={`badge-status ${
                        enrollment.status === 'enrolled' ? 'badge-enrolled' :
                        enrollment.status === 'completed' ? 'badge-completed' : 'badge-dropped'
                      }`}>
                        {enrollment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(enrollment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(enrollment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
