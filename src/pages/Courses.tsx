/**
 * Courses Page
 * CRUD operations for course management with search and pagination
 */

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { z } from 'zod';

// Course type definition
interface Course {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  credits: number;
  department: string | null;
  max_capacity: number;
  status: string;
}

// Validation schema
const courseSchema = z.object({
  course_code: z.string().min(1, 'Course code is required').max(20),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  credits: z.number().min(1).max(12),
  department: z.string().max(50).optional(),
  max_capacity: z.number().min(1).max(500),
  status: z.enum(['active', 'inactive']),
});

const ITEMS_PER_PAGE = 10;

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState<{
    course_code: string;
    title: string;
    description: string;
    credits: number;
    department: string;
    max_capacity: number;
    status: 'active' | 'inactive';
  }>({
    course_code: '',
    title: '',
    description: '',
    credits: 3,
    department: '',
    max_capacity: 30,
    status: 'active',
  });

  const { toast } = useToast();

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      let query = supabase.from('courses').select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`course_code.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setCourses(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm]);

  const resetForm = () => {
    setFormData({
      course_code: '',
      title: '',
      description: '',
      credits: 3,
      department: '',
      max_capacity: 30,
      status: 'active',
    });
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      title: course.title,
      description: course.description || '',
      credits: course.credits,
      department: course.department || '',
      max_capacity: course.max_capacity,
      status: course.status as 'active' | 'inactive',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = courseSchema.safeParse(formData);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }

    try {
      const courseData = {
        ...formData,
        description: formData.description || null,
        department: formData.department || null,
      };

      if (editingCourse) {
        const { error } = await supabase.from('courses').update(courseData).eq('id', editingCourse.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Course updated successfully' });
      } else {
        const { error } = await supabase.from('courses').insert([courseData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Course created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchCourses();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="content-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground">Manage course catalog</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Code *</Label>
                    <Input
                      value={formData.course_code}
                      onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                      placeholder="CS101"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Introduction to Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Course description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Credits *</Label>
                    <Input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                      min={1}
                      max={12}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 30 })}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="CS"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCourse ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No courses found</TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.course_code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.department || '-'}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.max_capacity}</TableCell>
                    <TableCell>
                      <span className={`badge-status ${course.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {course.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
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
