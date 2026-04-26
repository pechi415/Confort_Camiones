function calcularSimilitudIA(s1, s2) {
  if (!s1 || !s2) return 0;
  
  const normalizar = (str) => {
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => !['muy', 'demasiado', 'bastante', 'mucho', 'un', 'poco', 'del', 'de', 'la', 'el', 'en', 'con', 'que', 'se'].includes(w))
      .map(w => {
        if (['golpea', 'golpeando', 'golpeteo', 'choca', 'impacto', 'fuerte'].includes(w)) return 'golpe';
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

const unificarComentariosIA = (texto) => {
  if (!texto || texto === '-') return '';
  
  let partesRaw = texto.split(/\s*[,|]\s*/).filter(p => p.length > 2);
  
  if (partesRaw.length <= 1) return texto;

  let unificados = [];
  
  partesRaw.sort((a, b) => b.length - a.length);

  partesRaw.forEach(parteOriginal => {
    const textoPuro = parteOriginal.replace(/^(?:G[1-3]|General):\s*/i, '').trim();
    
    let esRedundante = unificados.some(yaUnificadoOriginal => {
      const yaUnificadoPuro = yaUnificadoOriginal.replace(/^(?:G[1-3]|General):\s*/i, '').trim();
      
      if (yaUnificadoPuro.toLowerCase().includes(textoPuro.toLowerCase())) return true;
      
      const similitud = calcularSimilitudIA(textoPuro, yaUnificadoPuro);
      console.log(`Comparando: '${textoPuro}' con '${yaUnificadoPuro}', Similitud: ${similitud}`);
      return similitud > 0.85; 
    });

    if (!esRedundante) {
      unificados.push(parteOriginal);
    } else {
      console.log(`DESCARTADO: ${parteOriginal}`);
    }
  });

  return unificados.join(' | ');
};

console.log(unificarComentariosIA("G2: Golpe Fuerte del Lado Izquierdo | G1: Golpea del Lado de la Cabina"));
