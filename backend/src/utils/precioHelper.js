const configRepository = require("../repositories/configRepository");

/**
 * Calcula los campos dinámicos (precio final y duración efectiva) para una relación BarberoServicio.
 * 
 * - Si el barbero tiene configurado un porcentaje personalizado (`porcentaje` en BarberoServicio),
 *   este se aplica sobre el precio base del servicio.
 * - En caso contrario, se utiliza el porcentaje global configurado para el salón (`porcentajeSalon` en Config).
 * - Se almacena `porcentajeCustom` y `duracionCustom` con los valores originales sin herencia 
 *   para que las pantallas de edición (admin/barbero) sepan si el campo está vacío (heredado).
 * 
 * @param {Object} relation Documento o POJO de BarberoServicio
 * @param {Number} [porcentaje] Porcentaje global del salón (opcional, para evitar múltiples consultas a DB en bucles)
 * @returns {Promise<Object>} La relación procesada con precio y duración final
 */
async function calculateDynamicFields(relation, porcentaje) {
  if (!relation) return null;

  let p = porcentaje;
  if (p === undefined) {
    const config = await configRepository.getConfig();
    p = config.porcentajeSalon || 0;
  }

  const obj = relation.toObject ? relation.toObject() : relation;

  // Preservamos los valores originales ingresados por el usuario para los formularios de edición
  obj.porcentajeCustom = relation.porcentaje;
  obj.duracionCustom = relation.duracion;

  const base = relation.servicio?.precioBase || 0;
  const markupPercent = relation.porcentaje !== undefined && relation.porcentaje !== null
    ? relation.porcentaje
    : p;

  // El precio final para el cliente se calcula aplicando el porcentaje de recargo sobre el precio base
  obj.precio = Math.round(base * (1 + markupPercent / 100) * 100) / 100;

  // Si no se definió duración personalizada para este barbero, hereda la duración por defecto del servicio
  obj.duracion = relation.duracion || relation.servicio?.duracion || 0;

  return obj;
}

/**
 * Procesa un turno poblando y calculando dinámicamente los datos de su barberoServicio.
 * 
 * @param {Object} turno Documento o POJO de Turno
 * @param {Number} [porcentaje] Porcentaje global de salón (opcional)
 * @returns {Promise<Object>} El turno procesado con precios dinámicos
 */
async function calculateDynamicTurno(turno, porcentaje) {
  if (!turno) return null;
  const obj = turno.toObject ? turno.toObject() : turno;
  if (obj.barberoServicio) {
    obj.barberoServicio = await calculateDynamicFields(obj.barberoServicio, porcentaje);
  }
  return obj;
}

module.exports = {
  calculateDynamicFields,
  calculateDynamicTurno,
};

