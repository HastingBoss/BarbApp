# Diseño relacional simplificado — Equivalencia Mongo ↔ SQL

## Introducción

Este documento detalla las simplificaciones aplicadas al modelo de datos del proyecto para adaptarlo al alcance de un trabajo final, priorizando facilidad de corrección y menor superficie de error, sin perder de vista el aporte principal: precios custom por barbero.

---

## 1. Simplificación del Polimorfismo de Clientes

### En MongoDB (Modelo Simple)
El campo `Turno.cliente` utiliza `refPath` apuntando a `clienteModel`:
```js
cliente: {
  type: mongoose.Schema.Types.ObjectId,
  refPath: "clienteModel"
},
clienteModel: {
  type: String,
  enum: ["User", "ClienteInvitado"]
}
```
Esto permite asociar un turno a un usuario registrado (`User`) o a uno sin cuenta (`ClienteInvitado`) de manera polimórfica simple en Mongoose.

### En SQL (Decisión de Diseño y Limitación Aceptada)
En un diseño corporativo estricto, para modelar esto en bases de datos relacionales se suele implementar **Class Table Inheritance** (con tablas `clientes` padre, y `cliente_registrado` y `cliente_invitado` hijas). 
Para este proyecto académico, se optó por **simplificar la estructura** y no crear estas tablas de herencia. En su lugar, la tabla `turnos` contiene directamente las columnas `cliente_id` y `cliente_model`, gestionando la asociación polimórfica a nivel lógico en la aplicación (sin clave foránea real en la base de datos para esa columna). 
Esto es una **limitación aceptada** en pos de simplificar la base de datos SQL.

---

## 2. Simplificación de Horarios

### En MongoDB y SQL
Se eliminó por completo el almacenamiento de horarios en la base de datos (tanto la colección/tabla independiente como los campos embebidos en `Barbero`).

La disponibilidad horaria ahora se define a nivel de lógica de negocio en la aplicación con un cronograma semanal fijo estándar (Lunes a Sábado de 09:00 a 20:00, Domingos cerrado). Esto elimina por completo la necesidad de almacenar y sincronizar configuraciones de horarios individuales de cada barbero en la base de datos, simplificando la lógica de disponibilidad y el panel de administración.

---

## 3. Simplificación del Flujo de Estados del Turno

Los estados del turno han sido reducidos a:
* `"pendiente"`: Estado inicial y activo (confirmado automáticamente al crearse).
* `"cancelado"`: Turno cancelado (por el cliente o el sistema).
* `"completado"`: Servicio ya realizado de manera exitosa.

Se eliminaron los estados `"accepted"` y `"rejected"`, removiendo la necesidad de un flujo intermedio de aprobación/rechazo por parte del barbero, lo que simplifica tanto las vistas del frontend (agenda y wizard de reservas) como las rutas y lógica del backend.
