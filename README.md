# BarbApp - Sistema de Gestión de Turnos de Barbería

**Desarrollador:** Hasting.dev (Luca Guerra) <!-- test-trigger -->

Sistema de gestión de turnos para barberías con arquitectura monorepo, que incluye un backend en Node.js y un frontend en React estructurado modularmente con hojas de estilo CSS dedicadas por componente.


## Stack Tecnologico

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (JsonWebToken)
- bcrypt
- Nodemailer
- CORS
- dotenv

### Frontend
- React
- Vite
- React Router DOM
- Fetch API
- Vanilla CSS (Variables CSS globales y modulos locales por componente)

### Deploy y Ops
- Vercel (Configuracion monorepo)

---

## Estructura del Proyecto

```text
BarbApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── barberoController.js
│   │   │   ├── configController.js
│   │   │   ├── servicioController.js
│   │   │   └── turnoController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Barbero.js
│   │   │   ├── ClienteInvitado.js
│   │   │   ├── Config.js
│   │   │   ├── Servicio.js
│   │   │   ├── Turno.js
│   │   │   └── User.js
│   │   ├── repositories/
│   │   │   ├── authRepository.js
│   │   │   ├── barberoRepository.js
│   │   │   ├── configRepository.js
│   │   │   ├── servicioRepository.js
│   │   │   └── turnoRepository.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── barberos.js
│   │   │   ├── config.js
│   │   │   ├── servicios.js
│   │   │   └── turnos.js
│   │   ├── services/
│   │   │   ├── disponibilidadService.js
│   │   │   └── emailService.js
│   │   ├── utils/
│   │   │   ├── seed.js
│   │   │   ├── ServerError.js
│   │   │   └── token.js
│   │   └── index.js
│   ├── package.json
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Layout.css
│   │   │   ├── ProtectedRoute/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── ProtectedRoute.css
│   │   │   └── ReservaWizard/
│   │   │       ├── ReservaWizard.jsx
│   │   │       └── ReservaWizard.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useForm.js
│   │   │   └── useRequest.js
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Login.css
│   │   │   ├── Register/
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Register.css
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard/
│   │   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   │   └── AdminDashboard.css
│   │   │   │   ├── AdminBarberos/
│   │   │   │   │   ├── AdminBarberos.jsx
│   │   │   │   │   └── AdminBarberos.css
│   │   │   │   ├── AdminServicios/
│   │   │   │   │   ├── AdminServicios.jsx
│   │   │   │   │   └── AdminServicios.css
│   │   │   │   ├── AdminTurnos/
│   │   │   │   │   ├── AdminTurnos.jsx
│   │   │   │   │   └── AdminTurnos.css
│   │   │   │   └── AdminConfig/
│   │   │   │       ├── AdminConfig.jsx
│   │   │   │       └── AdminConfig.css
│   │   │   ├── barbero/
│   │   │   │   └── BarberoAgenda/
│   │   │   │       ├── BarberoAgenda.jsx
│   │   │   │       └── BarberoAgenda.css
│   │   │   └── cliente/
│   │   │       ├── ClienteReserva/
│   │   │       │   ├── ClienteReserva.jsx
│   │   │       │   └── ClienteReserva.css
│   │   │       └── ClienteHistorial/
│   │   │           ├── ClienteHistorial.jsx
│   │   │           └── ClienteHistorial.css
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
│   ├── package.json         <- Configuracion de workspaces npm
└── README.md
```

---

## Setup e Instalacion Local

### Requisitos Previos
- Node.js (Version 16 o superior)
- MongoDB corriendo localmente o un cluster de MongoDB Atlas

### Instrucciones de Inicializacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/HastingBoss/BarbApp.git
cd BarbApp

# 2. Instalar dependencias para todos los workspaces
npm run install:all
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raiz del proyecto con el siguiente contenido, reemplazando con tus valores reales:

```env
# --- Backend Config ---
PORT=4000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/barberia
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=7d

# Nodemailer (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tucorreo@gmail.com
MAIL_PASS=tu_app_password

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# --- Frontend Config ---
VITE_API_URL=http://localhost:4000/api
```

### 4. Inicializar base de datos y correr servidores

```bash
# Inicializar base de datos con datos de prueba (seed)
npm run seed --workspace=backend

# Ejecutar la aplicacion localmente
# Terminal 1: Servidor Backend
npm run dev:backend

# Terminal 2: Servidor Frontend
npm run dev:frontend
```

---

## Deploy en Vercel

1. Crear 2 proyectos en Vercel apuntando a este repositorio.
2. Configurar el primer proyecto como **Framework Preset: Other** apuntando a la carpeta `backend/`, usar su respectivo archivo `vercel.json` y definirlo como **Build Output: None**.
3. Configurar el segundo proyecto como **Framework Preset: React** apuntando a la carpeta `frontend/`, usar su respectivo archivo `vercel.json` y definirlo como **Build Output: None**.
4. Configurar las variables de entorno detalladas anteriormente en el panel de control del proyecto Vercel (Settings -> Environment Variables).
5. El backend se desplegara como Serverless Functions y el frontend como sitio estatico SPA con soporte de enrutamiento.

---

## Endpoints de la API

### Auth - `/api/auth`
- `POST /register` - Registro de nuevos clientes.
- `POST /login` - Autenticacion del usuario (retorna token JWT y perfil).
- `GET /me` - Devuelve el perfil del usuario activo (requiere JWT).
- `GET /verify-email` - Confirma el correo del usuario.

### Barberos - `/api/barberos`
- `GET /` - Listar todos los barberos.
- `GET /:id` - Detalle de un barbero.
- `GET /por-servicio/:servicioId` - Lista barberos asignados a un servicio.
- `GET /me/perfil` - Obtener datos del barbero logueado (requiere JWT).
- `POST /` - Crear nuevo barbero (requiere Rol Admin).
- `PUT /:id` - Editar perfil de barbero (requiere Rol Admin).
- `PUT /:id/servicios` - Asignar lista de servicios al barbero (requiere Rol Admin).
- `GET /:id/metricas` - Visualizar cantidad de turnos e ingresos (requiere Rol Admin).

### Servicios - `/api/servicios`
- `GET /` - Listar todos los servicios del catalogo.
- `GET /:id` - Detalle de un servicio.
- `POST /` - Crear servicio (requiere Rol Admin).
- `PUT /:id` - Editar servicio (requiere Rol Admin).
- `DELETE /:id` - Soft-delete desactivando el servicio (requiere Rol Admin).

### Turnos - `/api/turnos`
- `GET /disponibilidad` - Consultar horarios libres filtrando por barbero, servicio y fecha (excluye automáticamente franjas horarias pasadas si la consulta es para el día en curso en la zona horaria del salón).
- `POST /` - Reservar un turno (soporta reservas registradas e invitados).
- `GET /` - Listar todos los turnos del sistema (requiere Rol Admin).
- `GET /barbero/:id` - Listar turnos asignados a un barbero.
- `GET /barbero/:id/resumen-dia` - Generar resumen textual y detectar baches libres del dia.
- `GET /cliente/:id` - Listar historial de reservas de un cliente.
- `DELETE /:id` - Cancelar una reserva.
- `PATCH /:id/completar` - Marcar reserva como completada.

### Config - `/api/config`
- `GET /` - Obtener configuración global del salón (porcentaje de recargo).
- `PUT /` - Actualizar porcentaje de recargo del salón (requiere Rol Admin).