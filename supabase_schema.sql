-- ==========================================
-- ANGRAFIT TRAINER - SCHEMA COMPLETO (FINAL)
-- ==========================================
-- Instruções: Copie TODO o código abaixo e cole no "SQL Editor" do seu Supabase.
-- Clique em "RUN" para criar todas as tabelas e permissões de uma vez.

-- 1. LIMPEZA (OPCIONAL - Cuidado se já tiver dados)
-- DROP TABLE IF EXISTS public.foods, public.meals, public.diets, public.exercises, public.workouts, public.payments, public.messages, public.schedules, public.progress, public.clients, public.gym_settings CASCADE;

-- 2. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  goal TEXT NOT NULL,
  level TEXT NOT NULL,
  gender TEXT NOT NULL,
  plan TEXT NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  photo TEXT,
  observations TEXT,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE TREINOS
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  weight TEXT NOT NULL,
  rest_time INTEGER NOT NULL DEFAULT 60
);

-- 5. TABELA DE DIETAS
CREATE TABLE IF NOT EXISTS public.diets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE REFEIÇÕES
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diet_id UUID REFERENCES public.diets(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- 7. TABELA DE ALIMENTOS
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  observations TEXT
);

-- 8. TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  method TEXT NOT NULL,
  pix_key TEXT,
  payment_link TEXT,
  description TEXT NOT NULL
);

-- 9. TABELA DE MENSAGENS / AVISOS
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read BOOLEAN DEFAULT false
);

-- 10. TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  notes TEXT
);

-- 11. TABELA DE PROGRESSO / MEDIDAS
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  arms NUMERIC,
  thighs NUMERIC
);

-- 12. TABELA DE CONFIGURAÇÕES DA ACADEMIA
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  gym_name TEXT NOT NULL DEFAULT 'AngraFit Academia',
  address TEXT,
  phone TEXT,
  email TEXT,
  admin_password TEXT DEFAULT 'admin',
  CONSTRAINT one_row CHECK (id = 1)
);

-- 13. INICIALIZAR CONFIGURAÇÕES (Se não existir)
INSERT INTO public.gym_settings (id, gym_name) 
VALUES (1, 'AngraFit Academia')
ON CONFLICT (id) DO NOTHING;

-- 14. HABILITAR RLS (Segurança)
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

-- 15. POLÍTICAS DE ACESSO (Público para facilitar MVP)
-- Nota: Em produção, você deve restringir para auth.uid()
CREATE POLICY "Public Access" ON public.clients FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.workouts FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.exercises FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.diets FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.meals FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.foods FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.payments FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.messages FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.schedules FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.progress FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.gym_settings FOR ALL USING (true);

-- 16. STORAGE BUCKETS (Pastas de arquivos)
-- Isso cria a pasta 'avatars' para as fotos dos alunos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- FIM DO SCRIPT
-- ==========================================