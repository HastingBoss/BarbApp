# Documentación del Sistema

## Diseño Relacional

El modelo de datos completo de la aplicación está diseñado de forma normalizada, de manera que es 100% transferible a una base de datos relacional (como PostgreSQL, MySQL o SQL Server) sin requerir cambios estructurales. 

Esto se logra eliminando por completo el uso de arrays de objetos o subdocumentos embebidos en los modelos principales. Cada relación y entidad se comporta de forma idéntica a una tabla SQL:

### Mapeo de Colecciones Mongoose a Tablas SQL

1. **User (Colección `User`)**
   - Representa la tabla `users`.
   - Almacena las cuentas registradas con campos simples (`name`, `email`, `password`, `role`, `emailVerified`, `hasRecargo`, `totalCortes`).

2. **Barbero (Colección `Barbero`)**
   - Representa la tabla `barberos`.
   - Se conecta con `users` mediante una clave foránea 1:1 (`user`). No contiene arrays embebidos.

3. **Servicio (Colección `Servicio`)**
   - Representa la tabla `servicios`.
   - Contiene el catálogo general de servicios (`nombre`, `precioBase`, `duracion`, `active`).

4. **BarberoServicio (Colección `BarberoServicio`)**
   - Representa la tabla de unión/intersección `barbero_servicios` para modelar la relación Muchos a Muchos entre `Barbero` y `Servicio`.
   - Contiene claves foráneas hacia `barberos` y `servicios`, además de atributos opcionales de anulación (`precio` y `duracion`).

5. **ClienteInvitado (Colección `ClienteInvitado`)**
   - Representa la tabla `cliente_invitados` para almacenar de forma simple los datos de contacto de clientes no registrados.

6. **Turno (Colección `Turno`)**
   - Representa la tabla `turnos`.
   - Contiene claves foráneas hacia `barberos` (`barbero_id`) y `barbero_servicios` (`barbero_servicio_id`).
   - El cliente se almacena de forma polimórfica (`cliente` + `clienteModel`), lo cual en SQL se implementa típicamente mediante dos columnas (`cliente_id` y `cliente_type`) o una tabla base común.

7. **Config (Colección `Config`)**
   - Representa la tabla `configs`.
   - Almacena variables globales del salón (`porcentajeSalon`).
