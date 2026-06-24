-- =========================================================================
-- ESQUEMA SQL SIMPLIFICADO (TRABAJO FINAL)
-- Se eliminaron las complejidades de herencia (Class Table Inheritance) y
-- la tabla Horario para reflejar el modelo simplificado del proyecto.
-- =========================================================================

CREATE TYPE user_role AS ENUM ('admin', 'barbero', 'cliente');
CREATE TYPE turno_estado AS ENUM ('pendiente', 'cancelado', 'completado');

-- =========================================================================
-- users — Centraliza tanto a los administradores, barberos como clientes.
-- En esta versión simplificada, has_recargo vive de forma
-- directa en la tabla de usuarios sin requerir tablas hijas.
-- =========================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'cliente',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barberos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    duracion INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barbero_servicios (
    id SERIAL PRIMARY KEY,
    barbero_id INTEGER NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
    servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    precio NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (barbero_id, servicio_id)
);

-- NOTA: Horarios no existen como tabla en el esquema simplificado de SQL.
-- Al igual que en la base de datos documental (Mongo), se asume que en
-- un modelo puramente relacional requeriría una tabla separada, pero se
-- ha omitido para reducir la complejidad estructural del trabajo final.

-- El sistema de beneficios de fidelidad ha sido removido del proyecto final.

-- =========================================================================
-- turnos — En esta versión simplificada, se utiliza una referencia polimórfica 
-- libre (cliente_id + cliente_model) sin clave foránea física (FK).
-- Limitación aceptada y documentada para simplificar el alcance escolar.
-- =========================================================================
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    barbero_id INTEGER NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
    barbero_servicio_id INTEGER NOT NULL REFERENCES barbero_servicios(id) ON DELETE RESTRICT,
    cliente_id INTEGER NOT NULL, -- Apunta a users(id) si cliente_model es 'User'
    cliente_model VARCHAR(50) NOT NULL, -- 'User' o 'ClienteInvitado'
    fecha DATE NOT NULL,
    hora_inicio VARCHAR(5) NOT NULL,
    estado turno_estado DEFAULT 'pendiente',
    cancelado_en TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evita solapamientos para turnos que estén activos (estado 'pendiente')
CREATE UNIQUE INDEX idx_booking_slot ON turnos (barbero_id, fecha, hora_inicio)
WHERE estado = 'pendiente';
