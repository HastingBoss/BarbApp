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

### En MongoDB
Se eliminó la colección externa `Horario`. Los horarios semanales ahora viven directamente como un array de subdocumentos embebidos dentro de la colección `Barbero`:
```js
horarios: [
  {
    dia: { type: String, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true }
  }
]
```
Esto simplifica significativamente el backend (rutas y controladores), eliminando la necesidad de repositorios intermedios (`horarioRepository.js`).

### En SQL
Debido a que SQL no cuenta con tipos complejos embebidos nativos como los arrays de subdocumentos (salvo soporte JSON específico de algunos motores), un modelo relacional estricto requeriría una tabla separada `horarios` con clave foránea `barbero_id`.
Sin embargo, para este proyecto escolar, **se documenta esta necesidad pero no se implementa en SQL**, omitiendo la tabla `horarios` por completo para simplificar el entregable.

---

## 3. Simplificación del Flujo de Estados del Turno

Los estados del turno han sido reducidos a:
* `"pendiente"`: Estado inicial y activo (confirmado automáticamente al crearse).
* `"cancelado"`: Turno cancelado (por el cliente o el sistema).
* `"completado"`: Servicio ya realizado de manera exitosa.

Se eliminaron los estados `"accepted"` y `"rejected"`, removiendo la necesidad de un flujo intermedio de aprobación/rechazo por parte del barbero, lo que simplifica tanto las vistas del frontend (agenda y wizard de reservas) como las rutas y lógica del backend.
