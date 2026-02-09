-- Columna status en profiles: 'pending', 'pending_approval', 'approved', 'rejected'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_approval';

-- Permitir que un usuario inserte su propio perfil (para registro)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir que un usuario actualice su propio perfil (solo algunos campos si lo necesitas)
-- Los admins aprobados pueden actualizar status de otros vía RLS o service role.

-- Tabla de citas (appointments)
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- RLS para appointments (los usuarios pueden insertar sus propias citas; admin puede leer todas)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own appointment"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.status = 'approved'
    )
  );

-- Super Admin: después de crear el usuario en Supabase Auth (diegoloor124@gmail.com),
-- insertar o actualizar en profiles:
-- INSERT INTO profiles (id, email, full_name, role, status)
-- SELECT id, email, raw_user_meta_data->>'full_name', 'admin', 'approved'
-- FROM auth.users WHERE email = 'diegoloor124@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'approved';
