# Estructura de la Base de Datos

## Resumen de la Estructura Actual

La base de datos se estructura en 6 colecciones principales: 
- `users` almacena las cuentas de usuario con roles diferenciados (`admin`, `barbero`, `cliente`).
- `barberos` mantiene los perfiles de cada profesional vinculados a un usuario.
- `servicios` define los tratamientos disponibles y sus duraciones estimadas.
- `barbero_servicios` asocia cada barbero con los servicios que ofrece asignando un precio personalizado (relación muchos a muchos con atributos).
- `cliente_invitados` registra datos de contacto de clientes sin cuenta que reservan en la plataforma.
- `turnos` consolida las reservas vinculando el barbero, la relación específica de barbero-servicio con su precio, el cliente (registrado o invitado de forma polimórfica) y el estado del turno (`pendiente`, `cancelado`, `completado`).

---

## DDL SQL para Importar en DrawDB

Podés importar este script DDL de PostgreSQL directamente en DrawDB para generar el diagrama relacional correspondiente:

```sql
CREATE TYPE user_role AS ENUM ('admin', 'barbero', 'cliente');
CREATE TYPE turno_estado AS ENUM ('pendiente', 'cancelado', 'completado');

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
    user_id INTEGER UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    duracion INTEGER NOT NULL, -- en minutos
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barbero_servicios (
    id SERIAL PRIMARY KEY,
    barbero_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (barbero_id, servicio_id),
    FOREIGN KEY (barbero_id) REFERENCES barberos(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
);

CREATE TABLE cliente_invitados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    barbero_id INTEGER NOT NULL,
    barbero_servicio_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL, -- ID polimórfico apuntando a users o cliente_invitados
    cliente_model VARCHAR(50) NOT NULL, -- 'User' | 'ClienteInvitado'
    fecha DATE NOT NULL,
    hora_inicio VARCHAR(5) NOT NULL, -- formato "HH:mm"
    estado turno_estado DEFAULT 'pendiente',
    cancelado_en TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barbero_id) REFERENCES barberos(id) ON DELETE CASCADE,
    FOREIGN KEY (barbero_servicio_id) REFERENCES barbero_servicios(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX idx_booking_slot ON turnos (barbero_id, fecha, hora_inicio) 
WHERE estado = 'pendiente';
```
```
