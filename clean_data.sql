-- ======================================================
-- SCRIPT DE RESET DE DADOS (LIMPEZA TOTAL)
-- ======================================================
-- Este script apaga todos os registros de todas as tabelas
-- mas mantém a estrutura (tabelas, colunas, chaves, RLS).

BEGIN;

-- 1. LIMPAR TABELAS (Truncate reseta IDs e ignora FKs com CASCADE)
TRUNCATE TABLE 
    public.progress,
    public.schedules,
    public.messages,
    public.payments,
    public.foods,
    public.meals,
    public.diets,
    public.exercises,
    public.workouts,
    public.clients,
    public.gym_settings
RESTART IDENTITY CASCADE;

-- 2. REINSERIR CONFIGURAÇÃO BÁSICA (Obrigatório para o App funcionar)
INSERT INTO public.gym_settings (id, gym_name, admin_password) 
VALUES (1, 'AngraFit Academia', '2486')
ON CONFLICT (id) DO UPDATE SET admin_password = EXCLUDED.admin_password;

-- 3. LIMPAR STORAGE (Fotos de Clientes)
-- Nota: Isso remove os registros de arquivos, mas não apaga o bucket em si.
DELETE FROM storage.objects WHERE bucket_id = 'avatars';

COMMIT;

-- ======================================================
-- INSTRUÇÕES:
-- 1. Abra o SQL Editor do Supabase.
-- 2. Cole este script e clique em "Run".
-- 3. Isso deixará seu banco 100% "virgem", mas com a senha admin '2486'.
-- ======================================================
