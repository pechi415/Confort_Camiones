// src/utils/formatters.js

/**
 * Parsea una cadena de fecha a un objeto Date, manejando formatos DD/MM/YYYY.
 */
export const parseFecha = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  const regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[, ]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
  const match = dateStr.match(regex);
  if (match) {
    const [ , dia, mes, anio, h, min, s ] = match;
    return new Date(anio, mes - 1, dia, h || 0, min || 0, s || 0);
  }
  return null;
};

/**
 * Formatea una fecha en formato corto DD/MM/YYYY.
 */
export const formatFechaCorta = (dateStr) => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = String(d.getFullYear());
      return `${dia}/${mes}/${anio}`;
    }
    return dateStr.substring(0, 10).replace(/[,.\s]+$/, '');
  } catch (e) {
    return dateStr.substring(0, 10).replace(/[,.\s]+$/, '') || '---';
  }
};

/**
 * Formatea una fecha y hora en formato DD/MM/YYYY HH:MM.
 */
export const formatFechaYHora = (dateStr) => {
  if (!dateStr) return '---';
  const d = parseFecha(dateStr);
  if (!d) return dateStr.substring(0, 16);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = String(d.getFullYear());
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${h}:${min}`;
};

/**
 * Transforma un grupo (ej: "1, 2") en un formato visual legible ("G1 | G2").
 */
export const formatGrupo = (grupo) => {
  if (!grupo) return '--';
  const str = String(grupo);
  const matches = str.match(/\d+/g);
  if (!matches) return str;
  return matches.map(g => `G${g}`).join(' | ');
};

/**
 * Calcula y formatea el tiempo transcurrido entre dos fechas.
 */
export const formatearCiclo = (inicio, fin, ingresoEvaluar) => {
  const startRaw = ingresoEvaluar || inicio;
  if (!startRaw || !fin) return '---';
  try {
    const start = parseFecha(startRaw);
    const end = parseFecha(fin);
    if (!start || !end) return '---';
    
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs < 0) return '---';
    
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `${days}d ${remHours}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  } catch (e) { return '---'; }
};
