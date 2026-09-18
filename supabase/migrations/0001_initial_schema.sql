-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    employee_code VARCHAR(100),
    joining_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('present', 'absent', 'half_day')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, attendance_date)
);

CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE NOT NULL UNIQUE,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID, 
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE backup_logs (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_started_at TIMESTAMPTZ DEFAULT NOW(),
    backup_completed_at TIMESTAMPTZ,
    status VARCHAR(50) CHECK (status IN ('running', 'success', 'failed')),
    file_name VARCHAR(255),
    google_drive_file_id VARCHAR(255),
    file_size INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start_date DATE NOT NULL UNIQUE,
    is_locked BOOLEAN DEFAULT true,
    locked_by UUID REFERENCES auth.users(id),
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    unlocked_at TIMESTAMPTZ
);

-- 2. Indexes
CREATE INDEX idx_employees_category ON employees(category_id);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);

-- 3. Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_locks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "Admins can manage employees" ON employees FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "Admins can manage attendance" ON attendance FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "Admins can manage holidays" ON holidays FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "Admins can manage locks" ON attendance_locks FOR ALL TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "Admins can view backups" ON backup_logs FOR SELECT TO authenticated USING (public.is_authorized_admin());

-- Immutable Audit Logs
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_authorized_admin());