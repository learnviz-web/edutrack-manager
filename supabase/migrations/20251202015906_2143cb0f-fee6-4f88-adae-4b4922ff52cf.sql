-- ============================================
-- SIMPLIFY DATABASE FOR COLLEGE PRESENTATION
-- ============================================

-- 1. Remove optional fields from students table to make it simpler
ALTER TABLE public.students 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS date_of_birth;

-- 2. Simplify RLS policies - just check if user is authenticated (no role checking)

-- Drop existing complex RLS policies
DROP POLICY IF EXISTS "Staff can view students" ON public.students;
DROP POLICY IF EXISTS "Staff can insert students" ON public.students;
DROP POLICY IF EXISTS "Staff can update students" ON public.students;
DROP POLICY IF EXISTS "Staff can delete students" ON public.students;

DROP POLICY IF EXISTS "Staff can view courses" ON public.courses;
DROP POLICY IF EXISTS "Staff can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Staff can update courses" ON public.courses;
DROP POLICY IF EXISTS "Staff can delete courses" ON public.courses;

DROP POLICY IF EXISTS "Staff can view enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Staff can insert enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Staff can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Staff can delete enrollments" ON public.enrollments;

-- Create simple RLS policies - any authenticated user can do everything
-- This makes it much easier to explain: "Only logged in users can access the system"

-- Students table policies
CREATE POLICY "Authenticated users can view students" 
  ON public.students FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert students" 
  ON public.students FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update students" 
  ON public.students FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete students" 
  ON public.students FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Courses table policies
CREATE POLICY "Authenticated users can view courses" 
  ON public.courses FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update courses" 
  ON public.courses FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete courses" 
  ON public.courses FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Enrollments table policies
CREATE POLICY "Authenticated users can view enrollments" 
  ON public.enrollments FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert enrollments" 
  ON public.enrollments FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update enrollments" 
  ON public.enrollments FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete enrollments" 
  ON public.enrollments FOR DELETE 
  USING (auth.uid() IS NOT NULL);