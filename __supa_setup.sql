-- Tira de Configuración SQL para Proyecto Drummond Confort (Supabase)

-- 1. CREACIÓN DE LA TABLA DE USUARIOS
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  username text unique not null,
  password text not null,
  role text check(role in ('admin', 'supervisor', 'operador')) not null,
  mina text check(mina in ('PB', 'ED', 'Ambas')) not null,
  estado text check(estado in ('Activo', 'Inactivo')) default 'Activo',
  firstTime boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Reglas de Seguridad base para la tabla (Row Level Security)
alter table usuarios enable row level security;
create policy "Los usuarios registrados pueden ver las listas" on usuarios for select using (true);
create policy "Sólo Administradores modifican u operan usuarios" on usuarios for all using (true); -- RLS será ajustado luego a base de tokens.

-- Insertar el Super Administrador Maestro de Arranque
insert into usuarios (nombre, username, password, role, mina, estado, firstTime)
values 
  ('Alexander Francisco Ramírez Córdoba', 'aramirez', 'con123', 'admin', 'Ambas', 'Activo', false);

-----------------------------------------------------------------------------------------

-- 2. CREACIÓN DE LA TABLA PÚBLICA DE CAMIONES EN MANTENIMIENTO KANBAN
create table if not exists camiones (
  id serial primary key,
  flota text not null,
  mina text check(mina in ('PB', 'ED')) not null,
  estado text check(estado in ('espera', 'evaluar', 'evaluados', 'taller', 'feedback', 'garantia')) not null,
  atencion text check(atencion in ('NORMAL', 'ALTA', 'CRÍTICA')) not null,
  time text not null,
  fallas text,
  operador text,
  puntos integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Seguridad para la Lectura de Kanban
alter table camiones enable row level security;
create policy "Permitir Seleccion Libre Kanban" on camiones for select using (true);
create policy "Permitir Inserciones, Mods y DragDrop" on camiones for all using (true);

-- Insertar un Camión de Prueba Básico
insert into camiones (flota, mina, estado, atencion, time, fallas, operador, puntos)
values 
  ('2410', 'PB', 'taller', 'ALTA', 'Hoy 07:00 AM', 'Falla Cabina Principal - No enfría', 'Miguel Torres', 30);
