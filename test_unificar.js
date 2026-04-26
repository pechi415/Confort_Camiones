const normalizar = (str) => {
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u03000-\u036f]/g, "")
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => !['muy', 'demasiado', 'bastante', 'mucho', 'un', 'poco', 'del', 'de', 'la', 'el', 'en', 'con', 'que', 'se'].includes(w))
      .map(w => {
        if (['golpea', 'golpeando', 'golpeteo', 'choca', 'impacto'].includes(w)) return 'golpe';
        if (['suena', 'sonido', 'ruido', 'chirrido', 'cruje'].includes(w)) return 'ruido';
        if (['cabina', 'izquierdo', 'izq'].includes(w)) return 'izq';
        if (['derecho', 'der', 'derecha'].includes(w)) return 'der';
        if (['rigidaz', 'rigida', 'rigidas', 'dura', 'duras', 'tiesa', 'brinca'].includes(w)) return 'rigidez';
        if (['falla', 'dano', 'averia', 'descompuesto', 'roto', 'partido'].includes(w)) return 'dano';
        if (['tolva', 'volquete', 'platon', 'caja', 'tolba'].includes(w)) return 'tolva';
        if (['suspension', 'amortiguacion', 'cilindro', 'puntal'].includes(w)) return 'suspension';
        if (['llanta', 'neumatico', 'rueda', 'goma'].includes(w)) return 'llanta';
        if (['freno', 'frenando', 'frenado', 'balata', 'pastilla'].includes(w)) return 'freno';
        return w;
      })
      .join(' ');
  };
console.log("n1:", normalizar("Están Vaciadas"));
console.log("n2:", normalizar("Golpea Duro del Lado Izquierdo"));
