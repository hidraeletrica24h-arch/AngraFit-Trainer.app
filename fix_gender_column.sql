-- SCRIPT DE CORREÇÃO: ADICIONAR COLUNA GÊNERO
-- Execute este código no SQL Editor do seu Supabase para corrigir o erro de criação de clientes.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='gender') THEN
        ALTER TABLE public.clients ADD COLUMN gender TEXT NOT NULL DEFAULT 'masculino';
    END IF;
END $$;

-- Garante que todos os campos obrigatórios estão lá
ALTER TABLE public.clients ALTER COLUMN gender SET NOT NULL;
