/**
 * ============================================
 * STUDENTS PAGE (CRUD OPERATIONS)
 * ============================================
 * This page allows users to:
 * 1. View all students in a table
 * 2. Add new students
 * 3. Edit existing students
 * 4. Delete students
 * 5. Search students by name or ID
 * 
 * Key concepts for presentation:
 * - CRUD = Create, Read, Update, Delete
 * - Real-time data from database
 * - Search functionality
 * - Form validation
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

// ============================================
// STUDENT DATA TYPE
// ============================================
interface Student {
  id: string;           // Unique identifier (UUID)
  student_id: string;   // Student ID (like "STU001")
  first_name: string;
  last_name: string;
  email: string;
  enrollment_date: string;
  status: string;       // active or inactive
  created_at: string;
  updated_at: string;
}

export default function Students() {
  // ============================================
  // STATE VARIABLES (Data storage)
  // ============================================
  const [students, setStudents] = useState<Student[]>([]);  // All students from database
  const [loading, setLoading] = useState(true);             // Is data loading?
  const [searchTerm, setSearchTerm] = useState('');         // Search input
  const [dialogOpen, setDialogOpen] = useState(false);      // Is add/edit dialog open?
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);  // Student being edited

  // Form data for add/edit
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
  });

  const { toast } = useToast();  // For showing success/error messages

  // ============================================
  // FETCH STUDENTS FROM DATABASE
  // ============================================
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Query the database using Supabase client
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });  // Newest first

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error loading students', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load students when page first loads
  useEffect(() => {
    fetchStudents();
  }, []);

  // ============================================
  // SEARCH FILTER
  // ============================================
  // Filter students based on search term
  const filteredStudents = students.filter((student) =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setEditingStudent(null);
  };

  // ============================================
  // EDIT STUDENT
  // ============================================
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    // Fill form with student's current data
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      enrollment_date: student.enrollment_date,
      status: student.status as 'active' | 'inactive',
    });
    setDialogOpen(true);
  };

  // ============================================
  // CREATE OR UPDATE STUDENT
  // ============================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Prevent page reload

    try {
      if (editingStudent) {
        // UPDATE existing student
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', editingStudent.id);  // Match by ID
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Student updated successfully' });
      } else {
        // CREATE new student
        const { error } = await supabase
          .from('students')
          .insert([formData]);
        
        if (error) {
          // Check for duplicate student ID
          if (error.code === '23505') {
            toast({ 
              variant: 'destructive', 
              title: 'Error', 
              description: 'Student ID already exists' 
            });
            return;
          }
          throw error;
        }
        toast({ title: 'Success', description: 'Student added successfully' });
      }

      // Close dialog and refresh list
      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message 
      });
    }
  };

  // ============================================
  // DELETE STUDENT
  // ============================================
  const handleDelete = async (id: string) => {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);  // Match by ID

      if (error) throw error;
      toast({ title: 'Success', description: 'Student deleted successfully' });
      fetchStudents();  // Refresh the list
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message 
      });
    }
  };

  // ============================================
  // RENDER UI
  // ============================================
  return (
    <DashboardLayout>
      <div className="content-container">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage student records</p>
          </div>
          
          {/* ADD STUDENT BUTTON - Opens dialog */}
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            
            {/* ADD/EDIT DIALOG */}
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              </DialogHeader>
              
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student ID */}
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID *</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    placeholder="STU001"
                    required
                  />
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Enrollment Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollment_date">Enrollment Date *</Label>
                    <Input
                      id="enrollment_date"
                      type="date"
                      value={formData.enrollment_date}
                      onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
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

                {/* Form Buttons */}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingStudent ? 'Update' : 'Add'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No students found matching your search' : 'No students yet. Add your first student!'}
                  </TableCell>
                </TableRow>
              ) : (
                // Map through filtered students and display each row
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{new Date(student.enrollment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`badge-status ${student.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Edit Button */}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Delete Button */}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
