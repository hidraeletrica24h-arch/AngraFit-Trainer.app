-- ======================================================
-- ANGRAFIT TRAINER - SCHEMA CONSOLIDADO FINAL (V2)
-- ======================================================
-- Este script executa o RESET TOTAL e recria a estrutura completa.

-- 1. RESET TOTAL
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.diets CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.gym_settings CASCADE;

-- 2. EXTENSÃO
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. CLIENTES
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT,
  height NUMERIC,
  weight NUMERIC,
  goal TEXT,
  level TEXT,
  gender TEXT,
  plan TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  photo TEXT,
  observations TEXT,
  password TEXT DEFAULT '123456',
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT now()
);

-- 4. TREINOS
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT,
  day_of_week TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. EXERCÍCIOS
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT,
  muscle_group TEXT,
  sets INT,
  reps TEXT,
  weight TEXT,
  rest_time INT DEFAULT 60
);

-- 6. DIETAS
CREATE TABLE public.diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. REFEIÇÕES
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_id UUID REFERENCES public.diets(id) ON DELETE CASCADE,
  name TEXT
);

-- 8. ALIMENTOS
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  name TEXT,
  quantity TEXT,
  observations TEXT
);

-- 9. PAGAMENTOS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT,
  amount NUMERIC,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pendente',
  method TEXT,
  pix_key TEXT,
  payment_link TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 10. MENSAGENS
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  type TEXT,
  date TIMESTAMP DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- 11. AGENDA
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT,
  date DATE,
  time TIME,
  duration INT DEFAULT 60,
  type TEXT,
  status TEXT DEFAULT 'agendado',
  notes TEXT
);

-- 12. PROGRESSO
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE,
  weight NUMERIC,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  arms NUMERIC,
  thighs NUMERIC
);

-- 13. CONFIGURAÇÃO DA ACADEMIA
CREATE TABLE public.gym_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  gym_name TEXT DEFAULT 'AngraFit Academia',
  address TEXT,
  phone TEXT,
  email TEXT,
  admin_password TEXT
);

-- INICIALIZAR CONFIGURAÇÕES
INSERT INTO public.gym_settings (id, gym_name, admin_password) 
VALUES (1, 'AngraFit Academia', '2486')
ON CONFLICT (id) DO UPDATE SET admin_password = EXCLUDED.admin_password;

-- 14. HABILITAR RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- 15. CRIAR POLÍTICAS (DEV ACCESS)
CREATE POLICY "dev_access_clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_workouts" ON public.workouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_diets" ON public.diets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_meals" ON public.meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_foods" ON public.foods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_progress" ON public.progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_access_gym_settings" ON public.gym_settings FOR ALL USING (true) WITH CHECK (true);

-- 16. STORAGE (RESET E CONFIGURAÇÃO)
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'avatars';

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
