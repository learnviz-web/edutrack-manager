-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credits INTEGER DEFAULT 3,
  department TEXT,
  max_capacity INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  grade TEXT,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
  UNIQUE (student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin or faculty
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role = 'admin' OR role = 'faculty')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Staff can view roles" ON public.user_roles
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for students (staff can CRUD)
CREATE POLICY "Staff can view students" ON public.students
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert students" ON public.students
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update students" ON public.students
  FOR UPDATE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete students" ON public.students
  FOR DELETE USING (public.is_staff(auth.uid()));

-- RLS Policies for courses (staff can CRUD)
CREATE POLICY "Staff can view courses" ON public.courses
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update courses" ON public.courses
  FOR UPDATE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete courses" ON public.courses
  FOR DELETE USING (public.is_staff(auth.uid()));

-- RLS Policies for enrollments (staff can CRUD)
CREATE POLICY "Staff can view enrollments" ON public.enrollments
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update enrollments" ON public.enrollments
  FOR UPDATE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete enrollments" ON public.enrollments
  FOR DELETE USING (public.is_staff(auth.uid()));

-- Trigger for profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();