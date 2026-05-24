// src/utils/iaEngine.js

/**
 * Elimina acentos y diacríticos de una cadena.
 */
export const reaccionarAcentos = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Normaliza nombres propios (Capitalize Case).
 */
export const normalizarNombre = (n) => {
  if (!n) return '';
  return n.toLowerCase().trim()
    .split(' ')
    .filter(p => p.length > 0)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

/**
 * Calcula la similitud entre dos cadenas usando bigramas y normalización minera.
 */
export function calcularSimilitudIA(s1, s2) {
  if (!s1 || !s2) return 0;
  
  const normalizar = (str) => {
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => !['muy', 'demasiado', 'bastante', 'mucho', 'un', 'poco', 'del', 'de', 'la', 'el', 'en', 'con', 'que', 'se', 'y', 'o', 'a', 'las', 'los', 'para', 'por'].includes(w))
      .map(w => {
        if (['golpea', 'golpeando', 'golpeteo', 'choca', 'impacto'].includes(w)) return 'golpe';
        if (['suena', 'sonido', 'ruido', 'chirrido', 'cruje'].includes(w)) return 'ruido';
        if (['cabina', 'izquierdo', 'izq'].includes(w)) return 'izq';
        if (['derecho', 'der', 'derecha'].includes(w)) return 'der';
        if (['rigidaz', 'rigida', 'rigidas', 'dura', 'duras', 'tiesa', 'brinca', 'saltarina'].includes(w)) return 'rigidez';
        if (['falla', 'dano', 'averia', 'descompuesto', 'roto', 'partido'].includes(w)) return 'dano';
        if (['tolva', 'volquete', 'platon', 'caja', 'tolba'].includes(w)) return 'tolva';
        if (['suspension', 'amortiguacion', 'cilindro', 'puntal'].includes(w)) return 'suspension';
        if (['llanta', 'neumatico', 'rueda', 'goma'].includes(w)) return 'llanta';
        if (['freno', 'frenando', 'frenado', 'balata', 'pastilla'].includes(w)) return 'freno';
        if (['alta', 'altas'].includes(w)) return 'alta';
        return w;
      })
      .join(' ');
  };

  const n1 = normalizar(s1);
  const n2 = normalizar(s2);

  if (n1 === n2) return 1;
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) bigrams.add(str.substring(i, i + 2));
    return bigrams;
  };
  const b1 = getBigrams(n1);
  const b2 = getBigrams(n2);
  if (b1.size === 0 || b2.size === 0) return 0;
  let intersection = 0;
  for (const b of b1) if (b2.has(b)) intersection++;
  return (2 * intersection) / (b1.size + b2.size);
}

/**
 * Especialista en nombres: Aplica tildes a nombres y apellidos conocidos.
 */
export const corregirNombresIA = (nombre) => {
  if (!nombre) return '';
  let n = nombre;
  const apellidos = {
    'Ramirez': 'Ramírez', 'Gonzalez': 'González', 'Rodriguez': 'Rodríguez', 'Martinez': 'Martínez',
    'Perez': 'Pérez', 'Sanchez': 'Sánchez', 'Hernandez': 'Hernández', 'Garcia': 'García',
    'Lopez': 'López', 'Diaz': 'Díaz', 'Gomez': 'Gómez', 'Vasquez': 'Vásquez', 'Jimenez': 'Jiménez',
    'Gutierrez': 'Gutiérrez', 'Alvarez': 'Álvarez', 'Suarez': 'Suárez', 'Muñoz': 'Muñoz', 
    'Mendez': 'Méndez', 'Nuñez': 'Núñez', 'Velasquez': 'Velásquez', 'Chavez': 'Chávez',
    'Bermudez': 'Bermúdez', 'Avila': 'Ávila', 'Marin': 'Marín', 'Guzman': 'Guzmán', 'Beltran': 'Beltrán',
    'Castaño': 'Castaño', 'Peña': 'Peña', 'Cortez': 'Cortéz'
  };

  Object.keys(apellidos).forEach(sinTilde => {
    // Usamos 'gi' para que no importe si el usuario escribió en minúsculas
    const regex = new RegExp(`\\b${sinTilde}\\b`, 'gi');
    n = n.replace(regex, apellidos[sinTilde]);
  });
  return n;
};

/**
 * Corrige errores ortográficos comunes en el contexto minero.
 */
export const corregirOrtografiaIA = (texto) => {
  if (!texto) return '';
  let t = texto;
  const diccionario = {
    'tolba': 'tolva', 'suspencion': 'suspensión', 'valvula': 'válvula', 'vibrasion': 'vibración',
    'vibracion': 'vibración', 'frena': 'freno', 'presion': 'presión', 'hidraulico': 'hidráulico',
    'direccion': 'dirección', 'transmicion': 'transmisión', 'transmision': 'transmisión',
    'recalienta': 'se recalienta', 'vacio': 'vacío', 'neumatico': 'neumático', 'botiquin': 'botiquín',
    'bateria': 'batería', 'codigo': 'código', 'dinamico': 'dinámico', 'estatico': 'estático',
    'proximo': 'próximo', 'despues': 'después', 'tambien': 'también', 'ademas': 'además',
    'aun': 'aún', 'todavia': 'todavía', 'mas': 'más', 'porsentaje': 'porcentaje', 'asiento': 'asiento',
    'cabina': 'cabina', 'golpea': 'golpea', 'ruido': 'ruido', 'fuga': 'fuga', 'bote': 'fuga',
    'pateo': 'pateo', 'fisura': 'fisura', 'grieta': 'fisura', 'suelto': 'suelto', 'flojo': 'suelto',
    // v12.7: Diccionario de Apellidos (Corrección de Tildes)
    'ramirez': 'Ramírez', 'gonzalez': 'González', 'rodriguez': 'Rodríguez', 'martinez': 'Martínez',
    'perez': 'Pérez', 'sanchez': 'Sánchez', 'hernandez': 'Hernández', 'garcia': 'García',
    'lopez': 'López', 'diaz': 'Díaz', 'gomez': 'Gómez', 'vasquez': 'Vásquez', 'jimenez': 'Jiménez',
    'gutierrez': 'Gutiérrez', 'alvarez': 'Álvarez', 'ruiz': 'Ruiz', 'suarez': 'Suárez',
    'muñoz': 'Muñoz', 'mendez': 'Méndez', 'nuñez': 'Núñez', 'quintero': 'Quintero',
    'castaño': 'Castaño', 'peña': 'Peña', 'velasquez': 'Velásquez', 'chavez': 'Chávez',
    'bermudez': 'Bermúdez', 'caicedo': 'Caicedo', 'avila': 'Ávila', 'marin': 'Marín',
    'guzman': 'Guzmán', 'beltran': 'Beltrán', 'cortez': 'Cortéz'
  };

  Object.keys(diccionario).forEach(bad => {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    t = t.replace(regex, diccionario[bad]);
  });
  
  // Asegurar que la primera letra siempre sea mayúscula sin borrar los espacios finales
  if (t.length > 0) {
    t = t.replace(/^\s*[a-záéíóúüñ]/i, (letter) => letter.toUpperCase());
  }
  
  return t;
};

/**
 * Unifica comentarios similares usando el motor de similitud IA.
 */
export const unificarComentariosIA = (originalComment) => {
  if (!originalComment || originalComment === '-') return '';
  
  const groups = originalComment.split(/\s*[,|]\s*/);
  const uniqueGroups = [];

  groups.forEach(group => {
    const cleanGroup = group.replace(/^(?:G\w+|General)\s*[:-]\s*/gi, '').trim();
    if (!cleanGroup) return;

    let found = false;
    for (let i = 0; i < uniqueGroups.length; i++) {
      const sim = calcularSimilitudIA(cleanGroup, uniqueGroups[i]);
      if (sim > 0.85) {
        if (cleanGroup.length > uniqueGroups[i].length) {
          uniqueGroups[i] = cleanGroup;
        }
        found = true;
        break;
      }
    }
    if (!found) uniqueGroups.push(cleanGroup);
  });

  return uniqueGroups.join(' | ');
};

/**
 * Procesa y limpia un string complejo de fallas, separando items de observaciones.
 */
export const limpiarFallasIA = (fallasStr, fallasData) => {
  try {
    if (!fallasStr) return [];
    
    const result = [];
    let depth = 0;
    let start = 0;

    const processItem = (text) => {
      if (!text || text === '-') return;
      
      let nameCandidate = text;
      const obsParts = [];

      const textLimpio = reaccionarAcentos(text.toLowerCase());
      const itemEncontrado = (fallasData || []).find(f => 
          textLimpio.startsWith(reaccionarAcentos(f.nombre.toLowerCase())) || 
          (f.aliases && f.aliases.some(alias => textLimpio.startsWith(reaccionarAcentos(alias.toLowerCase()))))
      );
      
      if (itemEncontrado) {
          nameCandidate = itemEncontrado.nombre;
          const resto = text.substring(itemEncontrado.nombre.length).trim();
          if (resto) {
              const matches = [...resto.matchAll(/\(([^)]+)\)/g)];
              if (matches.length > 0) {
                  matches.forEach(m => {
                      const content = m[1].replace(/(?:G\d+|General)\s*[:-]\s*/gi, '').trim();
                      if (content && content !== '-') obsParts.push(content);
                  });
              } else {
                  const limpio = resto.replace(/(?:G\d+|General)\s*[:-]\s*/gi, '').trim();
                  if (limpio && limpio !== '-') obsParts.push(limpio);
              }
          }
      } else {
          const regexParens = /\(([^)]+)\)/g;
          const matches = [...text.matchAll(regexParens)];
          
          if (matches.length > 0) {
              matches.forEach(m => {
                  const content = m[1];
                  if (content.match(/(?:G\d+|General)\s*[:-]/i)) {
                    const pPuro = content.replace(/(?:G\d+|General)\s*[:-]\s*/gi, '').trim();
                      if (pPuro && pPuro !== '-') obsParts.push(pPuro);
                      nameCandidate = nameCandidate.replace(m[0], '').trim();
                  }
              });
              
              if (obsParts.length === 0) {
                  const lastMatch = matches[matches.length - 1];
                  obsParts.push(lastMatch[1].trim());
                  nameCandidate = text.substring(0, lastMatch.index).trim();
              }
          }
      }

      const finalObs = [...new Set(obsParts)].filter(o => o && o !== '-').map(o => corregirOrtografiaIA(o));

      result.push({
          falla: nameCandidate || text,
          obs: finalObs.join(' | ') || '-'
      });
    };

    for (let i = 0; i < fallasStr.length; i++) {
      const char = fallasStr[i];
      if (char === '(') depth++;
      if (char === ')') depth--;

      if (depth === 0 && (char === '|' || char === '/' || char === ',')) {
        processItem(fallasStr.substring(start, i).trim());
        start = i + 1;
      }
    }
    processItem(fallasStr.substring(start).trim());

    return result;
  } catch (e) {
    console.error("Error en limpiarFallasIA:", e);
    return [];
  }
};

/**
 * Algoritmo de Inteligencia Algorítmica para detectar el 'Primer Apellido' oficial (v1.7.0)
 * y generar un alias único para el usuario.
 */
export const generarAliasBase = (nombreCompleto, bdActual) => {
  const palabras = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 0);
  if (!palabras || palabras.length === 0) return "";

  const conectores = ['de', 'la', 'del', 'los', 'las', 'y', 'san', 'santa'];
  const partes = palabras.filter(p => !conectores.includes(p.toLowerCase()));

  if (partes.length === 0) return "";

  const primeraLetra = partes[0].charAt(0).toLowerCase();
  let primerApellido = "";

  const nombresComunesV3 = [
    'david', 'jose', 'maria', 'carlos', 'luis', 'antonio', 'manuel', 'francisco', 'jesus',
    'miguel', 'angel', 'javier', 'alberto', 'eduardo', 'fernando', 'andres', 'felipe',
    'leonardo', 'ricardo', 'juan', 'pedro', 'victor', 'julio', 'cesar', 'diego', 'jorge',
    'hector', 'mario', 'oscar', 'ivan', 'ruben', 'hugo', 'pablo', 'gabriel', 'rafael',
    'camilo', 'alejandro', 'esteban', 'alonso', 'alfonso', 'enrique', 'ignacio', 'roberto',
    'arturo', 'ernesto', 'guillermo', 'mauricio', 'armando', 'raul', 'gerardo', 'ana',
    'martha', 'elena', 'rosa', 'carmen', 'teresa', 'diana', 'claudia', 'patricia', 'sandra'
  ];

  if (partes.length === 1) {
    primerApellido = partes[0].substring(1);
  } else if (partes.length === 2) {
    primerApellido = partes[1];
  } else if (partes.length === 3) {
    const segundaPalabra = partes[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (nombresComunesV3.includes(segundaPalabra)) {
      primerApellido = partes[2];
    } else {
      primerApellido = partes[1];
    }
  } else {
    primerApellido = partes[2];
  }

  const aliasPuro = (primeraLetra + primerApellido).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '');

  let aliasCandidato = aliasPuro;
  let contador = 1;
  while (bdActual && bdActual.some(usuario => usuario.username === aliasCandidato)) {
    aliasCandidato = aliasPuro + contador;
    contador++;
  }
  return aliasCandidato;
};
