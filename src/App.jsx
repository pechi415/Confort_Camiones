import React, { useState, useEffect } from 'react';
import './index.css';
import { LayoutDashboard, Zap, FileText, Blocks, ClipboardList, ShieldAlert, ShieldCheck, MonitorCheck, PlusCircle, Trash2, Edit3, Settings, Shield, Unlock, LockKeyhole, Lock, RefreshCcw, Users, AlertTriangle, CheckCircle2, Wrench, Activity, Truck, Search, Hourglass, SearchCheck, Award, FileSpreadsheet, MapPin, Calendar, Siren, AlertCircle, Info, History, ChevronUp } from 'lucide-react';

import { supabase } from './supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const LOGO_DRUMMOND = "iVBORw0KGgoAAAANSUhEUgAAAFcAAABBCAYAAACkRzjqAAAQAElEQVR4AdScC3Ab5bXH/yvtQ7aTSDbklpJ3gF4gQJJCyAMSSAivudwp917ae+feO7RMC8y00zSAndhOeA1xHNsxtKX03TLTJ+10SqFD22HaJoUkJCRxEscJIS8gBfrgYSk4sbQrafs/a8nxQ7J3Vyt30OizpG+/x9mfzp7vnPOtHLL5yGYyds+Pnrbj6x63E63f/HCWlm/Yieav26ee/q2dfudd285m7X/2IwTnYaP3F79DT9t30fPVH3w4y+OU+4kfIrGyCe/dejdOPv59pN/+q3N2/6w/ObicPp0GTHMMiwWkTNgf9MDuTvSVnlO5+XnMsyzSJw37VC+sV19Dz/pv473b78XpZ5+HfbqXJzj2zzNwQ3wbDgNjVRTAtrMIT5sEbeEcaPNnI/TRibDTGSCkwJ8cPAdNhaJpMjgy+15F4gsP4WTzE8h2x8ecLqUZ8zmBTAa2ZcFYPA/R9gac9bPHUfOTLyO6/j5oF50HuzfpwClJsjBPjZBtXh0933oK8QcfG3MzQQlKOgXvnTNZ2KYF47qFiLauRsXyxQjXVEP9yERU3noTJjTXQr30Y7BPJwnY+/DDeqjUZCjo/fGvkVjThvSbbw9rUq6KsYUrYEVjryfY9XXQzp8x7Lwii+cj1lwH9TICPnV62HFfFWoYCs1d8tlNSDzQjvSJt3wN47XT2MHNUmO5aOrXLUC0eXVBsHnhjauvRKytHtqC2VzwTuWrS3slYLHjyWf+iISYiBNvljaei95jA1c0VsAum4/q1gZo500fVTRjweWItdZDX/Rx2D3BaLCSB/xrAm5ogXXo6KhylNKg/HCpschmYCydj1hLA9QZU13Lq8+Z5dhlbdHcPsC27bpvsYaKeBOhMJK/eRHxxhaYrxwp1rTk+vLCFbD0DLRreZm38DKfOdWzwPrsi/mlrKIGEzB9WJQKWL4farCi6zA370KisbVsGlw+uDQFcMDOQ2xDPdSZ0zyDzXfQZ1ODN6yGvjAHWL60/EG/r3TVFF2D9cJuxOtbYL16zO9IRfuVB66cfCYNjRpb3VxPG+sfbF5yfc7FiLasgiaAxQ+WOfIH/b5K4ERf2NpCwKs3IGgbHDxcaqxtpaGLjaVXoJ4/+uLllo1OGxzLAxY/OBDACkBf2NragfjKR2Du6XIrzqjtQqO28NKAZiBrmdDpFUTXU8sCBJsXow/w6j4bLIBLtcEysGhwWIW1c38f4I79UltyCQ6uaCwjr8jyhYg11UG7YHiAULK0uQF0LnJRcdPEREigEQhgarCuId11GPF71sEMAHAwcAWsE3ktQrRpFbSPzcxhKN+LftlFiDLQcBa5nt5gJlIEsA6r81XEVxLw7s6Sxi0droBNW9CpsY4pKKPGDj1TB7Bo8KI5jOSCCTRAwErEIOBD6L6nCebOfUOndf25NLhcUGyJvBjSVtNV0spgY0c7k7yJ0BzAp0Zr7u64AK6IIN1JwLXNSG3b5a7fkFb+4RIsCNbg4uVEXj792GxvL1LbO2Du7WIulwn7IQK6+SiA+0Jl+sEfBAx43yHE721CcvM2N6IMauMPLk2BEyAI2NZGaB5C2oGzC9D376xH911r0X3nGnTf3eg7YyWAJYWpX5XLRQSxyDkabCB96DjiqzZ4BuwdrmgscwX6tfNR7eQKpgzk5fq9gE2sbUfymU3InHgb6SOvo/fp5xGva0b6z/5yrrpEci2roUkuQrwIkdW1REUaOoArkDnyZyQ8AvYGV4TlNozOyCvKk/CShBkoutl5AALW3LoXoaoIlEopFc72TOr325CoXc+k9l8GdnH9Xhc3bcMqiLmyZR9OrjLXvYs0pBMhi1z6GAHXUYP/9FKRhoOr3cMVIWljtaVXIiqLl08ba3YeZLJkI8xte6EYOiAOfF4mJrQla5Uk4PgAwPnDbl8NRnLRRx9A5IaruOvBTVeR3W3nYu0UQJI9mdfe5JffjKQLwO7gUjjZ85LIKyaRl4t8LAo8zP2vEGzbALCUeGg7wlYYjqae34p4bZNvE6ExAydJeePGq2GnUoBcdUPn8vqZJgKajszxt1wBHh1uLqQ1li/oCxB8+rEO2IZWWNv2wdFYEbTYyTkZKxWp57fAscFv+Ns1ELMVExNxEwEngwJMoXUV6eNvIi5u2gvbWVH4OTJc0dhcSBtdV+c7pDW7RGNbHY0FQ0xx1AuLM6BWNJg5VwHcveJhWD6T2ur0qYjRjEVEg3sFsD1gEp9vqRiSrszQBsdpvpIvFgZcHK6AZRLGkMhLcgU+Q1oHbD3BcvFSCMu5J8HtOQlg2mVz03Z000SYh4647TmonQCWBTgiGky/GgHwFQVRDLpph0/Qi2hB6uW9g+aUD4XhClgJaWX7m2lD7QJ/uQJn8XLA7oF8057AinRSREuqqiA518R9Tcy5lgCYGmzcvITb9qdl5NILlwylgoAPHkfi4a/QnTw+aMzhcLP8Wmn8DQlp2xrhN6R1/NjGNphbBOwQr2CQCC4+yElUVsJkzrWb0ZJ58LCLTsObODaYQU/klqVwbjwZ3sR7jXz5kougbB985ylkT5/uH2MQXJtRjc0AQbtiFu1UA9TpU/obenljdh1C4qGvwNzSAYWXNbhAeelfsK2cREUFF8S9iNeth7nvACR3nE0m4aWoU8/F+DWfdzZMAwPM81OUEJLPbYK544x5GAQX1FqFu6MG86QqXZmCJ+miUiaRYMCxsZzYRRd3TRzABqyX96P7sw1498bP4N2b78C7N7kvf1/2v0h8aR0v4TfgyOdu5tFb0TyID2zteaW/7WC4YunFka+u7m/g5032b+8B9DJk+8RP/xH7CGDKmD78Oqxd+2HtPgCrw0PZ1QWT/bLvdCOQK2qgsFZ2kLkZDJeCg/tfmbf8hZ75edQLpkEZXwXQ28jXBfbKxVauMP2aK1D5uU+h8i6WOz+JSrflrv9G5d3/g/BFM+EoQGCCcSA15ITyfOc8Q87f3B+Fro/N3EHyj9uQ3LYzV+v9peI/bkDkE9cxMrIAjud9hCI9uNDaDMH1a65E9dceQXX7WlS3rUH1Rr66Ke33s+0aVNy4GPLFc4kpMpGPavrQ4fOnQp17cX/nQXClVm75yRzriz6SHpLE0jdfwud8BNH7vwTj35cRMB13Rnn5Y75fBSxNjUH3MLaRi+20SYBcaV4KgOSLO5B48MtMI74OxdBYE8BTZMukEblpCSIL5vYPOAyuCCw+aeYV+m4SffgErM6YgljTfXDcnqQJuxTAIjzHMJZfhVirgJ3cfwJe3kiyJUG/O911FHKOXvoWbUv1F69DWzgH4z5zG5RIpL/pcLhyiNqgyDbHwWNwwjufJkJcuWhTLYxbrqXKUIMJSYb3VNjHFrDMcMUkzTm9BLBrNiJDh1/Sh55kKNZYwDJnoV44A9EHVkCb9a+DWhaGm2uiVFYg03UECSawUz53QgVwbH0dIv+2FALJ071eg8DWQ66GnGieXhyNJdj0gWMAXSZPnYs1Zqwld62r509DtKUexlXzhrUcEa60VsZVIb3/qBM/m51nfDg55rao0yYj+si9kBVeLiFXgAVsyoRxfc4U0My4nW9guz6w7RCwQWqs/FgmPJPnxe39yLULB07Z/35UuNJSqaqkP9mFxH3rYTLZLXVei3oev2FqsL7kikG+YMFxBKwsXmJj29dA9WsKuKkoOx7pA7SxDFFlPSk4n5dKmgKYaYRnTEasrQGRImBlSFdwoQBig8X5jjuA/WmwTpsUFcDXzEPfbx54bWHIQ/xYulvGdYsQe4xgGa4OaeHqY3LzViTuf9S56hRmr8B1xFXH0RoxDgjPmIToxnpEli4asbU7uDIEhZPLSiKiOLNTkvyWaq9Fv+RCOICXXA6bvqEEBP1jUGPB3Ia+bCGqH1sLdfK5/Ye8vEnt3IvEI08g3XkYSkSSRtQOLwMUaisaSzMVnj4J4gqOBlaGcA9XWgtgJmKsjoOIy90o+w9JrefiaDC9CH0xAXOXVhY6m6uuRIf6UoJlcBCe/FHP40oHkwvvSdHY3QchVxsYGEl9ScUBayFvY40RTMHAebzBlZ4CmMmd9B4CvncdTL+AL70IE9Z+ATp3kkMTYwif+y8w6ITH2hsRnuIPbKqjEwl6BeZ2biWJjQ0CLK8m2UVWZ53nWmMFkxTvcJ1e7CY3DYsGC2CmGKXaazHmfxw1T7ag+nvNiD25ATXfaoI6xacp6NiPRAN3lV8iWProCAVgCgQsfWzt8lmIProWxjWFvYJi501KxQ6NUk/hJcpxbLDcEehTg8Nnn43I1fMRmTcX4vaNMmvBw6k9ArYN1vZOKFUVCGTxErC0sdq8Sxhp1sGYNxsjPgoc9A9XBhMTITZ4dxdtsH8TIUP5LQL2ZL2ApcZWngk9/Y7n9KPHYvcmoc6jxjbXQfcBVsYpDa6MIIBp3yS3GhcT4VODZSivxcxprLmDYB2N9TpCgfYE6yysch8c9w+NK7xrbH7U0uHKSAKYdk52CBzAPgMNGcptkT26eENOYzm3234jthNT4GzMzmeA0Ajj8stGbD7awWDgyiwCmJeltYMrNjNP1uHXpLYsxdxDMyRg84sX5y55IgErd8cvW4BY8ypuzJb+s4Pg4MrZ8SQl2WPSFUqsaoZ1JHjAKfEKGjfCemkv/VgDQS1eYgqMG65GlGDVAj/4ho9HsHBFAMeL0JF6YSfitQR89HWpDaTIj0ASazfC3Mbtetr5QAIE2libuyXGf16PGLNbWkBg5YSDh+uMqjAZrXNrfZeT7Ekfe0NqSyqisfE17bDk7sjAwPb9U40IwUYfWgl16qSSZBzauTxwZRbRYEZy5tbddNOakD7mX4NTucjLymtsqdv1CgVkAkZ2Ryo+dTNiDxLsJH9RIUcq+iwfXJlSwk81DAHcfc86AvauwY4pEBsrGitegYwpY/stXBfslMWUchaVt9+K6LpahCed43e0EfuVF65MLTC0MC/nDmowAR93D9gBK14BF0iFnkjJIa2AlQRR1kbVHbdhwv0rED67RqQsSyk/XBFbAMsNzVt2o5uhctoFYAkQxI8Vz0PhdlPJXgFNgc1wVqG5qvrcJzG+4fMIV8dEurKVsYEr4hOw5CLMF3f2AR7Bi+j3Y/ORl/Qvsdg0BYoexrgVt0OyceGa8oIVcccOrjObAoW5CPOFl9HNHY10gUAjxZA2Lv//wAkQmISRfiUWm1tGihrCuC/ejvF1dyM0YUKJI7rrPrZwRSbRYO7tm5t3QCDKD/yyySQyJ08iuWkrEqtbIVGeIjZWkQ4lFmosKnSMq7sT41d+FgPvK0CZH2MPV06Idk9uGk7RRMTpRbz/6Vp037GaQccGboQegLODwMVHmvoqsnMgwQG/tNC0cxjO1mL8ijs47pkrQZL8H/zg5zj1q+eQ+fs7vqYZrdMZuBTGua9L7owZi0IAiqJwy/soks/+Acnf/AmZoycg//8LjPPlF5qeCyMt5xy4wQlDQ+X/fQI132tB1f//FxQmVJHBQQAAAK1JREFU95F7yJWSfv8dJLk7nNz8EtJ//RvkvuTc4cBezsCVH4LIDROyUzpWheZBiU1AaOJZLDVQouMBib78zq+rUM6OInLbjaj54UY4G6FzLxkGK6TpADdH1QumQ5kwDjAzdEbOoBjWwWeFM6KihDDh4RU465lvoOapxz6c5aeP4qxfPoGJzz0Juesxwi2Z0HiCKwSGEV5k4ZWoXL4EVbfdAv3SCwElCAOPQY9/AAAA//8WAgRHAAAABklEQVQDAJa1QjQOJzDfAAAAAElFTkSuQmCC";

// v3.0: Motor de IA de Trazabilidad - Normalización Semántica Avanzada
const normalizarNombre = (n) => {
  if (!n) return '';
  return n.toLowerCase().trim()
    .split(' ')
    .filter(p => p.length > 0)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

function calcularSimilitudIA(s1, s2) {
  if (!s1 || !s2) return 0;
  
  // Normalización Humana: Quitar conectores, intensificadores y unificar términos técnicos
  const normalizar = (str) => {
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u03000-\u036f]/g, "") // Quitar acentos
      .replace(/\s+/g, ' ')
      .trim()
      // Eliminar palabras de relleno e intensidad
      .split(' ')
      .filter(w => !['muy', 'demasiado', 'bastante', 'mucho', 'un', 'poco', 'del', 'de', 'la', 'el', 'en', 'con', 'que', 'se'].includes(w))
      // Unificar términos técnicos comunes de minería (Diccionario Drummond v3)
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

  const n1 = normalizar(s1);
  const n2 = normalizar(s2);

  if (n1 === n2) return 1;
  if (n1.includes(n2) || n2.includes(n1)) return 0.9; // Alta similitud por contención

  // Si no hay coincidencia exacta, usamos bigramas sobre el texto normalizado
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


// Motor de Limpieza Retroactiva (Aplica IA a datos existentes de la nube)
const corregirOrtografiaIA = (texto) => {
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
    'manguera': 'manguera', 'roto': 'roto', 'partido': 'partido', 'fisura': 'fisura', 'grieta': 'grieta',
    'soldadura': 'soldadura', 'perno': 'perno', 'tornillo': 'tornillo', 'suelto': 'suelto',
    'flojo': 'flojo', 'ajustar': 'ajustar', 'reemplazar': 'reemplazar', 'cambiar': 'cambiar',
    'revisar': 'revisar', 'chequear': 'chequear', 'limpiar': 'limpiar', 'engrasar': 'engrasar',
    'lubricar': 'lubricar', 'desgaste': 'desgaste', 'excesivo': 'excesivo', 'bajo': 'bajo',
    'alto': 'alto', 'nivel': 'nivel', 'temperatura': 'temperatura', 'caliente': 'caliente',
    'frio': 'frío', 'duro': 'duro', 'blando': 'blando', 'vacio': 'vacío', 'lleno': 'lleno',
    'luces': 'luces', 'faro': 'faro', 'stop': 'stop', 'reversa': 'reversa', 'alarma': 'alarma',
    'pito': 'pito', 'claxon': 'claxon', 'vidrio': 'vidrio', 'parabrisas': 'parabrisas',
    'limpiaparabrisas': 'limpiaparabrisas', 'puerta': 'puerta', 'chapa': 'chapa', 'manija': 'manija',
    'espejo': 'espejo', 'retrovisor': 'retrovisor', 'escalera': 'escalera', 'pasamanos': 'pasamanos',
    'extintor': 'extintor', 'botiquin': 'botiquín', 'llanta': 'llanta', 'neumatico': 'neumático',
    'rin': 'rin', 'tuerca': 'tuerca', 'valvula': 'válvula', 'tapa': 'tapa', 'tanque': 'tanque',
    'combustible': 'combustible', 'diesel': 'diésel', 'gasoil': 'gasoil', 'filtro': 'filtro',
    'agua': 'agua', 'radiador': 'radiador', 'tapa': 'tapa', 'correa': 'correa', 'ventilador': 'ventilador',
    'alternador': 'alternador', 'bateria': 'batería', 'cable': 'cable', 'borne': 'borne',
    'sulfatado': 'sulfatado', 'arranque': 'arranque', 'swich': 'switch', 'suich': 'switch',
    'encendido': 'encendido', 'tablero': 'tablero', 'pantalla': 'pantalla', 'falla': 'falla',
    'codigo': 'código', 'sensor': 'sensor', 'presion': 'presión', 'flujo': 'flujo',
    'velocidad': 'velocidad', 'marcha': 'marcha', 'cambio': 'cambio', 'neutro': 'neutro',
    'parqueo': 'parqueo', 'freno': 'freno', 'emergencia': 'emergencia', 'parqueo': 'parqueo',
    'servicio': 'servicio', 'retardo': 'retardo', 'dinamico': 'dinámico', 'estatico': 'estático',
    'prueba': 'prueba', 'bien': 'bien', 'mal': 'mal', 'regular': 'regular', 'malo': 'malo',
    'bueno': 'bueno', 'excelente': 'excelente', 'urgente': 'urgente', 'prioridad': 'prioridad',
    'taller': 'taller', 'campo': 'campo', 'ruta': 'ruta', 'via': 'vía', 'rampa': 'rampa',
    'botadero': 'botadero', 'pala': 'pala', 'cargador': 'cargador', 'tractor': 'tractor',
    'motoniveladora': 'motoniveladora', 'tanquero': 'tanquero', 'lubricador': 'lubricador',
    'mantenimiento': 'mantenimiento', 'preventivo': 'preventivo', 'correctivo': 'correctivo',
    'inspeccion': 'inspección', 'rutina': 'rutina', 'chequeo': 'chequeo', 'diario': 'diario',
    'turno': 'turno', 'dia': 'día', 'noche': 'noche', 'mañana': 'mañana', 'tarde': 'tarde',
    'hoy': 'hoy', 'ayer': 'ayer', 'mañana': 'mañana', 'proximo': 'próximo', 'anterior': 'anterior',
    'actual': 'actual', 'nuevo': 'nuevo', 'viejo': 'viejo', 'usado': 'usado', 'limpio': 'limpio',
    'sucio': 'sucio', 'grasa': 'grasa', 'polvo': 'polvo', 'barro': 'barro', 'agua': 'agua',
    'aceite': 'aceite', 'combustible': 'combustible', 'aire': 'aire', 'oxigeno': 'oxígeno',
    'nitrogeno': 'nitrógeno', 'fuego': 'fuego', 'incendio': 'incendio', 'humo': 'humo',
    'calor': 'calor', 'frio': 'frío', 'luz': 'luz', 'sonido': 'sonido', 'ruido': 'ruido',
    'olor': 'olor', 'quemado': 'quemado', 'dulce': 'dulce', 'podrido': 'podrido', 'fuerte': 'fuerte',
    'debil': 'débil', 'suave': 'suave', 'duro': 'duro', 'blando': 'blando', 'fragil': 'frágil',
    'resistente': 'resistente', 'pesado': 'pesado', 'liviano': 'liviano', 'grande': 'grande',
    'pequeño': 'pequeño', 'largo': 'largo', 'corto': 'corto', 'ancho': 'ancho', 'angosto': 'angosto',
    'alto': 'alto', 'bajo': 'bajo', 'profundo': 'profundo', 'superficial': 'superficial',
    'rapido': 'rápido', 'lento': 'lento', 'veloz': 'veloz', 'quieto': 'quieto', 'movimiento': 'movimiento',
    'vibracion': 'vibración', 'oscilacion': 'oscilación', 'giro': 'giro', 'vuelta': 'vuelta',
    'arriba': 'arriba', 'abajo': 'abajo', 'adelante': 'adelante', 'atras': 'atrás',
    'derecha': 'derecha', 'izquierda': 'izquierda', 'centro': 'centro', 'medio': 'medio',
    'lado': 'lado', 'esquina': 'esquina', 'borde': 'borde', 'punta': 'punta', 'fondo': 'fondo',
    'frente': 'frente', 'atras': 'atrás', 'cerca': 'cerca', 'lejos': 'lejos', 'dentro': 'dentro',
    'fuera': 'fuera', 'encima': 'encima', 'debajo': 'debajo', 'sobre': 'sobre', 'bajo': 'bajo',
    'entre': 'entre', 'hacia': 'hacia', 'desde': 'desde', 'por': 'por', 'para': 'para',
    'con': 'con', 'sin': 'sin', 'contra': 'contra', 'segun': 'según', 'hasta': 'hasta',
    'durante': 'durante', 'mientras': 'mientras', 'cuando' : 'cuando', 'donde': 'donde',
    'como': 'como', 'quien': 'quien', 'cual': 'cual', 'que': 'que', 'porque': 'porque',
    'pues': 'pues', 'entonces': 'entonces', 'luego': 'luego', 'despues': 'después',
    'antes': 'antes', 'ahora': 'ahora', 'siempre': 'siempre', 'nunca': 'nunca', 'jamas': 'jamás',
    'talvez': 'tal vez', 'quiza': 'quizá', 'quizas': 'quizás', 'tambien': 'también',
    'tampoco': 'tampoco', 'ademas': 'además', 'incluso': 'incluso', 'inclusive': 'inclusive',
    'aun': 'aún', 'todavia': 'todavía', 'ya': 'ya', 'apenas': 'apenas', 'casi': 'casi',
    'muy': 'muy', 'mucho': 'mucho', 'poco': 'poco', 'bastante': 'bastante', 'demasiado': 'demasiado',
    'tan': 'tan', 'tanto': 'tanto', 'mas': 'más', 'menos': 'menos', 'solo': 'solo',
    'unicamente': 'únicamente', 'precisamente': 'precisamente', 'exactamente': 'exactamente',
    'justamente': 'justamente', 'claramente': 'claramente', 'logicamente': 'lógicamente',
    'obviamente': 'obviamente', 'naturalmente': 'naturalmente', 'realmente': 'realmente',
    'verdaderamente': 'verdaderamente', 'seguramente': 'seguramente', 'posiblemente': 'posiblemente',
    'probablemente': 'probablemente', 'acaso': 'acaso', 'ojala': 'ojalá', 'amen': 'amén',
    'si': 'sí', 'no': 'no', 'así': 'así', 'peor': 'peor', 'mejor': 'mejor'
  };

  Object.keys(diccionario).forEach(error => {
    const regex = new RegExp(`\\b${error}\\b`, 'gi');
    t = t.replace(regex, diccionario[error]);
  });

  // Capitalización de la primera letra
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// v4.0: Motor de Unificación Semántica para Comentarios
const unificarComentariosIA = (texto) => {
  if (!texto || texto === '-') return '';
  
  // 1. Limpieza inicial de prefijos y normalización
  let limpio = texto.replace(/G[1-3]:\s*/g, '').trim();
  
  // 2. Dividir por el separador técnico | o ,
  let partes = limpio.split(/\s*[,|]\s*/).filter(p => p.length > 2);
  
  if (partes.length <= 1) return limpio;

  // 3. Proceso de Unificación Inteligente (Detección de Subconjuntos y Similitud)
  let unificados = [];
  
  // Ordenar por longitud descendente para priorizar la descripción más completa
  partes.sort((a, b) => b.length - a.length);

  partes.forEach(parteActual => {
    let esRedundante = unificados.some(yaUnificado => {
      // Si la parte actual ya está contenida en algo que ya unificamos, es redundante
      if (yaUnificado.toLowerCase().includes(parteActual.toLowerCase())) return true;
      
      // Similitud semántica (Levenshtein/IA)
      const similitud = calcularSimilitudIA(parteActual, yaUnificado);
      return similitud > 0.75; // Umbral de redundancia
    });

    if (!esRedundante) {
      unificados.push(parteActual);
    }
  });

  // Re-ensamblar con el separador oficial
  return unificados.join(' | ');
};

const limpiarFallasIA = (fallasStr) => {
  if (!fallasStr) return [];
  
  // v1.9.81 Motor de Separación por Profundidad (Ignora delimitadores dentro de paréntesis)
  const result = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < fallasStr.length; i++) {
    const char = fallasStr[i];
    if (char === '(') depth++;
    if (char === ')') depth--;

    // Si encontramos un delimitador (|, / o coma) y estamos en nivel 0 (fuera de paréntesis)
    if (depth === 0 && (char === '|' || char === '/' || char === ',')) {
      processItem(fallasStr.substring(start, i).trim());
      start = i + 1;
    }
  }
  // Procesar la última parte
  processItem(fallasStr.substring(start).trim());

  function processItem(text) {
      if (!text || text === '-') return;
      
      const openParen = text.indexOf('(');
      const closeParen = text.lastIndexOf(')');
      
      if (openParen !== -1 && closeParen !== -1 && closeParen > openParen) {
          const rawObs = text.substring(openParen + 1, closeParen).trim();
          // v1.9.86 Limpieza recursiva de observaciones internas (para datos históricos)
          const obsParts = rawObs.split(/\s*[|/]\s*/).filter(Boolean).map(p => p.replace(/^(?:G\d+|General)\s*[:\-]\s*/i, '').trim());
          const cleanObsParts = [];
          
          obsParts.forEach(part => {
              const duplicate = cleanObsParts.find(existing => 
                  calcularSimilitudIA(existing, part) > 0.4 || 
                  existing.toLowerCase().trim().includes(part.toLowerCase().trim()) || 
                  part.toLowerCase().trim().includes(existing.toLowerCase().trim())
              );
              if (!duplicate) {
                  cleanObsParts.push(part);
              } else if (part.length > duplicate.length) {
                  const idx = cleanObsParts.indexOf(duplicate);
                  cleanObsParts[idx] = part;
              }
          });

          result.push({
              falla: text.substring(0, openParen).trim(),
              obs: cleanObsParts.join(' | ') || '-'
          });
      } else {
          result.push({
              falla: text.trim(),
              obs: '-'
          });
      }
  }

  // Deduplicación e Inteligencia IA Humana de Comentarios (v1.9.95)
  return result.reduce((acc, current) => {
    const x = acc.find(item => item.falla.toLowerCase().trim() === current.falla.toLowerCase().trim());
    if (!x) return acc.concat([current]);
    
    if (current.obs !== '-' && x.obs !== '-') {
      const similitud = calcularSimilitudIA(x.obs, current.obs);
      // Umbral ajustado para la nueva normalización semántica
      if (similitud > 0.45) {
        // Nos quedamos con el más detallado (el más largo)
        if (current.obs.length > x.obs.length) {
          x.obs = current.obs;
        }
      } else {
        if (!x.obs.includes(current.obs)) {
          x.obs = `${x.obs} | ${current.obs}`;
        }
      }
    } else if (current.obs !== '-' && x.obs === '-') {
      x.obs = current.obs;
    }
    return acc;
  }, []);
};


function App() {
  // Versión del Sistema: 1.8.4 (Filtro Firma por Grupo)
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('drummond_activeTab') || 'dashboard');

  // Supabase Auth Session State
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('drummond_session');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Parche de compatibilidad: Si la sesión es vieja y usa 'rol', lo pasamos a 'role'
      if (parsed.rol && !parsed.role) parsed.role = parsed.rol;
      return parsed;
    } catch (e) {
      return null;
    }
  }); // null = No Logueado
  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login Form States
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Report Form State (Persistente)
  const [reportForm, setReportForm] = useState(() => {
    const saved = localStorage.getItem('drummond_report_form');
    if (!saved) return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {} };
    try {
      return JSON.parse(saved);
    } catch (e) {
      return { flota: '', operador: '', mina: 'PB', grupo: '1', selectedDanos: {}, observaciones: {} };
    }
  });

  const [flota, setFlota] = useState(reportForm.flota);
  const [operador, setOperador] = useState(reportForm.operador);
  const [mina, setMina] = useState(reportForm.mina);
  const [grupo, setGrupo] = useState(reportForm.grupo);
  const [selectedDanos, setSelectedDanos] = useState(reportForm.selectedDanos);
  const [observaciones, setObservaciones] = useState(reportForm.observaciones);
  const [editingGroupContext, setEditingGroupContext] = useState(null); // Contexto de grupo activo en edición (General, G1, G2, G3, Mantenimiento)
  const [selectedDanosEdit, setSelectedDanosEdit] = useState({});
  const [observacionesEdit, setObservacionesEdit] = useState({});
  const [operadorEdit, setOperadorEdit] = useState(''); 
  const [dictamenEdit, setDictamenEdit] = useState('');
  const [camionEditando, setCamionEditando] = useState(null); // Movido aquí para evitar WSoD (v5.3.1)  


  useEffect(() => {
    if (camionEditando && editingGroupContext) {
      sincronizarModal(camionEditando, editingGroupContext);
    }
  }, [editingGroupContext, camionEditando?.id]);

  // Efecto para persistir cambios en tiempo real
  useEffect(() => {
    sessionStorage.setItem('drummond_activeTab', activeTab);
    const state = { flota, operador, mina, grupo, selectedDanos, observaciones };
    localStorage.setItem('drummond_report_form', JSON.stringify(state));
  }, [activeTab, flota, operador, mina, grupo, selectedDanos, observaciones]);

  // Historial Filters State (Hooks deben ir arriba de los return tempranos)
  const [filtroFlota, setFiltroFlota] = useState('');
  const [filtroMina, setFiltroMina] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  // ---------- MÓDULO CRUD DE USUARIOS ----------
  const [dbUsuarios, setDbUsuarios] = useState([]);
  const [isCreandoUsuario, setIsCreandoUsuario] = useState(false);
  const [nuevoUsuarioParams, setNuevoUsuarioParams] = useState({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // Para el Modal de detalles técnicos
  const [expandedCardId, setExpandedCardId] = useState(null); // Acordeón de Kanban
  const [camionInGarantia, setCamionInGarantia] = useState(null); // Para el Modal de Motivo de Garantía
  const [selectedGarantiaDetails, setSelectedGarantiaDetails] = useState(null); // Para ver pendientes en modal
  const [pendientesGarantia, setPendientesGarantia] = useState({});
  const [registrosLimit, setRegistrosLimit] = useState(20);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Manejador de Doble Toque Táctico (Protección v1.9.43)
  const handleSafeDelete = (id, action) => {
    if (confirmDeleteId === id) {
      action();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000); // 4 segundos para confirmar
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [currentKanbanCol, setCurrentKanbanCol] = useState(0); 

  // Blindaje de Fechas v1.9.24 (Limpieza Universal de Comas)
  const formatFechaCorta = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = String(d.getFullYear());
        return `${dia}/${mes}/${anio}`;
      }
      // Limpiamos comas, puntos o espacios al final del recorte (ej: "16/04/2026, " -> "16/04/2026")
      return dateStr.substring(0, 10).replace(/[,.\s]+$/, '');
    } catch (e) {
      return dateStr.substring(0, 10).replace(/[,.\s]+$/, '') || '---';
    }
  };

  // Formateador de Grupos v1.9.27 (Transforma "1, 2" en "G1 | G2")
  const formatGrupo = (grupo) => {
    if (!grupo) return '--';
    const numStr = String(grupo);
    if (!numStr.includes(',')) return `G${numStr}`;
    return numStr.split(/,[\s]*/).map(g => `G${g.trim()}`).join(' | ');
  };

  const parseFecha = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    // Intento de parseo manual para formato DD/MM/YYYY, HH:MM:SS
    const regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[, ]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
    const match = dateStr.match(regex);
    if (match) {
      const [ , dia, mes, anio, h, min, s ] = match;
      return new Date(anio, mes - 1, dia, h || 0, min || 0, s || 0);
    }
    return null;
  };

  const formatFechaYHora = (dateStr) => {
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

  // Helper de Tiempo de Ciclo v2.1 (Ingreso -> Liberación)
  const formatearCiclo = (inicio, fin, ingresoEvaluar) => {
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

  // ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (ZERO BROWSER DIALOGS) ----------
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', // 'info', 'confirm', 'prompt'
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null,
    showInput: false,
    inputPlaceholder: '',
    inputValue: '',
    expectedValue: '' // Para el blindaje
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (opts) => {
    setModalConfig({
      isOpen: true,
      type: opts.type || 'info',
      title: opts.title || 'Atención',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Aceptar',
      cancelText: opts.cancelText || 'Cancelar',
      onConfirm: opts.onConfirm || null,
      onCancel: opts.onCancel || null,
      showInput: opts.type === 'prompt',
      inputPlaceholder: opts.placeholder || '',
      inputValue: '',
      expectedValue: opts.expectedValue || ''
    });
  };

  const handleModalConfirm = () => {
    if (modalConfig.type === 'prompt' && modalConfig.expectedValue) {
      if (modalConfig.inputValue !== modalConfig.expectedValue) {
        addToast("❌ El número ingresado no coincide.", "error");
        return;
      }
    }
    if (modalConfig.onConfirm) modalConfig.onConfirm(modalConfig.inputValue);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Algoritmo de Inteligencia Algorítmica para detectar el 'Primer Apellido' oficial (v1.6.2)
  const generarAliasBase = (nombreCompleto, bdActual) => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(p => p.length > 1);
    if (!partes || partes.length === 0) return "";

    const primeraLetra = partes[0].charAt(0).toLowerCase();
    let primerApellido = "";

    // Lista de nombres medios muy comunes (para ayudar a la IA a saltarlos en 3 palabras)
    const nombresComunesV2 = ['david', 'jose', 'maria', 'carlos', 'luis', 'antonio', 'manuel', 'francisco', 'jesus', 'miguel', 'angel', 'javier', 'david', 'alberto', 'eduardo', 'fernando', 'andres', 'felipe', 'leonardo', 'ricardo'];

    if (partes.length === 1) {
      primerApellido = partes[0].substring(1);
    } else if (partes.length === 2) {
      // Pedro Gonzalez -> pgonzalez
      primerApellido = partes[1];
    } else if (partes.length === 3) {
      // Juan David Perez -> jperez (Si la 2da es nombre común)
      // Juan Perez Rodriguez -> jperez (Si la 2da no es nombre común)
      const segundaPalabra = partes[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (nombresComunesV2.includes(segundaPalabra)) {
        primerApellido = partes[2];
      } else {
        primerApellido = partes[1];
      }
    } else if (partes.length >= 4) {
      // Alexander Francisco Ramirez Cordoba -> aramirez
      // Detectamos si hay conectores en la posición 1 (de, la, del)
      const conectores = ['de', 'la', 'del', 'los', 'las'];
      if (conectores.includes(partes[1].toLowerCase())) {
        // Juan de la Cruz Perez...
        primerApellido = partes[partes.length - 2];
      } else {
        primerApellido = partes[2];
      }
    } else {
      primerApellido = partes[1];
    }

    const aliasPuro = (primeraLetra + primerApellido).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '');

    // Verificador de Duplicados (Agrega 1, 2, 3...)
    let aliasCandidato = aliasPuro;
    let contador = 1;
    while (bdActual.some(usuario => usuario.username === aliasCandidato)) {
      aliasCandidato = aliasPuro + contador;
      contador++;
    }
    return aliasCandidato;
  };

  const fallas = [
    { id: 'tolva', nombre: 'Golpe de tolva', impacto: 25 },
    { id: 'suspensiones', nombre: 'Suspensiones', impacto: 25 },
    { id: 'nose_cone', nombre: 'Nose Cone', impacto: 15 },
    { id: 'barra', nombre: 'Barra estabilizadora (Hueso de perro)', impacto: 15 },
    { id: 'transmision', nombre: 'Transmisión al modular', impacto: 10 },
    { id: 'ruido', nombre: 'Ruido y polución en cabina', impacto: 5 },
    { id: 'varillaje', nombre: 'Varillaje de dirección', impacto: 5 },
    { id: 'otro', nombre: 'Otro', impacto: 0 },
  ];

  const handleDanoToggle = (id) => {
    setSelectedDanos(prev => ({ ...prev, [id]: !prev[id] }));
    if (selectedDanos[id]) {
      setObservaciones(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleObsChange = (id, text) => {
    setObservaciones(prev => ({ ...prev, [id]: text }));
  };

  // Calculadora...
  const totalImpacto = fallas.reduce((acc, curr) => {
    if (selectedDanos[curr.id]) return acc + curr.impacto;
    return acc;
  }, 0);

  const isFlotaValid = flota.length === 4 && flota.startsWith('2');

  // Kanban State (Nube real Supabase)
  const [camionesRegistrados, setCamionesRegistrados] = useState([]);

  // FETCH INICIAL AL MONTAR LA APP
  useEffect(() => {
    const fetchDatabase = async () => {
      // 1. Traer Usuarios en segundo plano para el Administrador
      const { data: usersInfo } = await supabase.from('usuarios').select('*');
      if (usersInfo) setDbUsuarios(usersInfo);

      // 2. Traer la Pila de Kanban
      const { data: flotaInfo } = await supabase.from('camiones').select('*');
      if (flotaInfo) setCamionesRegistrados(flotaInfo);
    };
    fetchDatabase();
  }, [session]); // Recarga si el estado auth cambia.

  // Filtro de Seguridad Global por Mina (v1.6.0)
  const camionesAccessibles = camionesRegistrados.filter(c => {
    if (session?.mina === 'Global' || session?.role === 'admin') return true;
    return c.mina === session?.mina;
  });

  const conteoLiberados = camionesAccessibles.filter(c => c.estado === 'liberado').length;
  
  const calcularPromedioCiclo = () => {
    const liberadosValidos = camionesAccessibles.filter(c => c.estado === 'liberado' && c.finalizado_at && (c.ingreso_evaluar_at || c.time || c.creado_at));
    if (liberadosValidos.length === 0) return "---";
    
    let validCount = 0;
    const sumaMs = liberadosValidos.reduce((acc, c) => {
      const startRaw = c.ingreso_evaluar_at || c.time || c.creado_at;
      const inicio = parseFecha(startRaw);
      const fin = parseFecha(c.finalizado_at);
      if (!inicio || !fin) return acc;
      
      const diffMs = fin - inicio;
      if (isNaN(diffMs) || diffMs < 0) return acc;
      
      validCount++;
      return acc + diffMs;
    }, 0);
    
    if (validCount === 0) return "---";
    
    const promMs = sumaMs / validCount;
    const hours = Math.floor(promMs / 3600000);
    const mins = Math.floor((promMs % 3600000) / 60000);
    return hours >= 24 ? `${Math.floor(hours/24)}d ${hours%24}h` : (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
  };

  const kpis = [
    { id: 'espera', titulo: 'Lista de Espera', icon: <Hourglass strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'espera').length.toString(), color: '#9ca3af', subtitulo: 'Pre-Programa' },
    { id: 'evaluar', titulo: 'Por Evaluar', icon: <Search strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluar').length.toString(), color: 'var(--secondary-blue)', subtitulo: 'En Programa' },
    { id: 'evaluados', titulo: 'Evaluados', icon: <SearchCheck strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'evaluados').length.toString(), color: '#8b5cf6', subtitulo: 'En Programa' },
    { id: 'taller', titulo: 'En Taller', icon: <Wrench strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'taller').length.toString(), color: 'var(--secondary-yellow)', subtitulo: 'Ejecución' },
    { id: 'feedback', titulo: 'Feedback', icon: <CheckCircle2 strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'feedback').length.toString(), color: '#10b981', subtitulo: 'Validación' },
    { id: 'garantia', titulo: 'Garantía', icon: <ShieldAlert strokeWidth={1.5} size={20} />, valor: camionesAccessibles.filter(c => c.estado === 'garantia').length.toString(), color: 'var(--primary-red)', subtitulo: 'Retorno VIP' }
  ];

  const columnasKanban = [
    { id: 'espera', titulo: 'Lista de Espera', icon: <Hourglass strokeWidth={1.5} size={18} />, color: '#9ca3af' },
    { id: 'evaluar', titulo: 'Por Evaluar', icon: <Search strokeWidth={1.5} size={18} />, color: 'var(--secondary-blue)' },
    { id: 'evaluados', titulo: 'Evaluados', icon: <SearchCheck strokeWidth={1.5} size={18} />, color: '#8b5cf6' },
    { id: 'taller', titulo: 'En Taller', icon: <Wrench strokeWidth={1.5} size={18} />, color: 'var(--secondary-yellow)' },
    { id: 'feedback', titulo: 'Feedback', icon: <CheckCircle2 strokeWidth={1.5} size={18} />, color: '#10b981' },
    { id: 'garantia', titulo: 'Garantía', icon: <ShieldAlert strokeWidth={1.5} size={18} />, color: '#ef4444' }
  ];

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('camion_id', id);
  };

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('camion_id');
    if (!idStr) return;

    // Interceptamos si es paso a GARANTÍA
    if (nuevoEstado === 'garantia') {
      const camion = camionesRegistrados.find(c => c.id.toString() === idStr);
      setCamionInGarantia(camion);
      // Inicializamos pendientes con formato de objeto { selected, comment }
      const iniciales = {};
      fallas.forEach(f => {
        if ((camion?.fallas || '').includes(f.nombre)) {
          // Extraemos el comentario original si existe (texto entre paréntesis después del nombre)
          const regex = new RegExp(`${f.nombre}\\s*\\(([^)]+)\\)`);
          const match = (camion?.fallas || '').match(regex);
          let originalComment = match ? match[1] : '';
          // Motor de IA v4.0: Unificación semántica inteligente de comentarios
          originalComment = unificarComentariosIA(originalComment);

          iniciales[f.id] = { selected: false, comment: originalComment };
        }
      });
      setPendientesGarantia(iniciales);
      return;
    }

    // UI Optimista (Instantáneo para el operador)
    setCamionesRegistrados(prev =>
      prev.map(c => {
        if (c.id.toString() === idStr) {
          const updates = { ...c, estado: nuevoEstado };
          if (nuevoEstado === 'evaluar' && !c.ingreso_evaluar_at) {
            updates.ingreso_evaluar_at = new Date().toISOString();
          }
          return updates;
        }
        return c;
      })
    );

    // Persistencia Oficial a la Nube (Asíncrono en segundo plano)
    const dbUpdates = { estado: nuevoEstado };
    const targetCamion = camionesRegistrados.find(c => c.id.toString() === idStr);
    if (nuevoEstado === 'evaluar' && targetCamion && !targetCamion.ingreso_evaluar_at) {
      dbUpdates.ingreso_evaluar_at = new Date().toISOString();
    }
    await supabase.from('camiones').update(dbUpdates).eq('id', parseInt(idStr));
  };

  // Función para confirmar el envío a garantía con motivos detallados
  const confirmarGarantia = async () => {
    if (!camionInGarantia) return;

    const motivosArray = Object.keys(pendientesGarantia)
      .filter(id => pendientesGarantia[id].selected)
      .map(id => {
        const nombre = fallas.find(f => f.id === id)?.nombre;
        const comment = pendientesGarantia[id].comment ? `: ${pendientesGarantia[id].comment}` : '';
        return `${nombre}${comment}`;
      });

    if (motivosArray.length === 0) return addToast("Por favor, selecciona al menos una falla que persista.", "error");

    const motivosStr = motivosArray.join(', ');

    // Actualizamos localmente
    setCamionesRegistrados(prev =>
      prev.map(c => c.id === camionInGarantia.id ? { ...c, estado: 'garantia', motivo_garantia: motivosStr } : c)
    );

    // Actualizamos en Supabase
    await supabase.from('camiones').update({
      estado: 'garantia',
      motivo_garantia: motivosStr
    }).eq('id', camionInGarantia.id);

    setCamionInGarantia(null);
  };

  const toggleAprobacion = async (camionId, grupo, valorActual) => {
    const key = `aprobado_${grupo}`;
    const nuevoValor = !valorActual;

    // UI Optimista
    setCamionesRegistrados(prev =>
      prev.map(c => c.id === camionId ? { ...c, [key]: nuevoValor } : c)
    );

    // DB update
    await supabase.from('camiones').update({ [key]: nuevoValor }).eq('id', camionId);
  };

  const liberarCamion = async (camionId, flota) => {
    const idNum = parseInt(camionId);
    if (isNaN(idNum)) return addToast("❌ ID de camión inválido", "error");

    const ahoraStr = new Date().toISOString();
    
    // UI Optimista: Movemos todos los registros de esta flota a liberado localmente
    setCamionesRegistrados(prev =>
      prev.map(c => (c.id === idNum || c.flota === flota) ? { ...c, estado: 'liberado', finalizado_at: ahoraStr } : c)
    );

    // Persistencia en DB: Liberamos TODO lo que coincida con esta flota y no esté liberado
    // Esto resuelve el problema de registros duplicados o "fantasmas"
    const { data, error } = await supabase.from('camiones')
      .update({ estado: 'liberado', finalizado_at: ahoraStr })
      .eq('flota', flota)
      .not('estado', 'eq', 'liberado')
      .select();

    if (error) {
      addToast("❌ Error en base de datos: " + error.message, "error");
      // Refresco forzado para recuperar estado real
      const { data: retry } = await supabase.from('camiones').select('*');
      if (retry) setCamionesRegistrados(retry);
    } else if (!data || data.length === 0) {
      addToast("⚠️ No se encontró el registro activo para liberar.", "warning");
    } else {
      addToast(`🚀 Camión ${flota} liberado con éxito. Sincronizando...`);
      
      setTimeout(async () => {
        const { data: flotaInfo } = await supabase.from('camiones').select('*').order('id', { ascending: false });
        if (flotaInfo) setCamionesRegistrados(flotaInfo);
      }, 1000);
    }
  };

  const eliminarCamion = async (camionId, flota) => {
    showConfirm({
      type: 'prompt',
      title: '⚠ ADVERTENCIA DE SEGURIDAD',
      message: `Esta acción eliminará permanentemente el reporte del Camión ${flota}.\n\nPara confirmar, escribe el número del camión a continuación:`,
      expectedValue: String(flota),
      placeholder: `Escribe ${flota} aquí...`,
      confirmText: 'ELIMINAR PERMANENTEMENTE',
      onConfirm: async () => {
        const { error } = await supabase.from('camiones').delete().eq('id', camionId);
        if (error) return addToast("Error al eliminar: " + error.message, "error");

        setCamionesRegistrados(prev => prev.filter(c => c.id !== camionId));
        addToast(`🗑️ Camión ${flota} eliminado exitosamente del sistema.`, "success");
      }
    });
  };

  const guardarEdicionCamion = async () => {
    if (!camionEditando) return;

    // Validación básica de flota (Inicia con 2 y tiene 4 digitos)
    if (!camionEditando.flota.startsWith('2') || camionEditando.flota.length !== 4) {
      return addToast("El número de flota debe tener 4 dígitos y comenzar por 2.", "error");
    }

    const { error } = await supabase.from('camiones').update({
      flota: camionEditando.flota,
      mina: camionEditando.mina,
      grupo: camionEditando.grupo,
      atencion: camionEditando.atencion
    }).eq('id', camionEditando.id);

    if (error) return addToast("Error al actualizar: " + error.message, "error");

    setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? camionEditando : c));
    setCamionEditando(null);
    addToast("✅ Cambios guardados en la nube.");
  };

  const prepararEdicion = (camion) => {
    setCamionEditando(camion);
    const context = session.role === 'admin' ? 'General' : `G${session.grupo}`;
    setEditingGroupContext(context);
    sincronizarModal(camion, context);
  };

  const prepararDictamen = (camion) => {
    setCamionEditando(camion);
    setEditingGroupContext('Mantenimiento');
    sincronizarModal(camion, 'Mantenimiento');
  };

  const sincronizarModal = (camion, context) => {
    if (!camion) return;
    
    setSelectedDanosEdit({});
    setObservacionesEdit({});
    setOperadorEdit('');
    setDictamenEdit(camion.dictamen_tecnico || '');

    const danos = {};
    const obs = {};
    let operadorUnificado = '';

    if (context === 'General') {
      operadorUnificado = camion.operador || '';
      if (camion.fallas) {
        const rawFallas = camion.fallas;
        const parts = [];
        let depth = 0;
        let lastSplit = 0;
        for (let i = 0; i < rawFallas.length; i++) {
          const char = rawFallas[i];
          if (char === '(') depth++;
          if (char === ')') depth--;
          if (depth === 0 && char === ',') {
            parts.push(rawFallas.substring(lastSplit, i).trim());
            lastSplit = i + 1;
          }
        }
        parts.push(rawFallas.substring(lastSplit).trim());

        parts.forEach(p => {
          if (!p || p === '-') return;
          const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
          if (match) {
            const nombreExtraido = match[1].trim().toLowerCase();
            const combinedObs = match[2] || '';
            const fallaObj = fallas.find(f => {
              const fNom = f.nombre.trim().toLowerCase();
              return fNom === nombreExtraido || fNom.includes(nombreExtraido) || nombreExtraido.includes(fNom);
            });
            if (fallaObj) {
              danos[fallaObj.id] = true;
              if (combinedObs) {
                // Limpieza de prefijos G1:, G2:, G3: y separadores para la vista unificada
                obs[fallaObj.id] = combinedObs.replace(/G[1-3]:\s*/g, '');
              }
            }
          }
        });
      }
    } else {
      const dg = camion.detalles_grupos || {};
      const miDetalle = dg[context];
      if (miDetalle) {
        operadorUnificado = miDetalle.operador || '';
        if (miDetalle.fallas) {
          Object.keys(miDetalle.fallas).forEach(fId => {
            danos[fId] = true;
            if (miDetalle.fallas[fId]) obs[fId] = miDetalle.fallas[fId];
          });
        }
      }
    }

    setSelectedDanosEdit(danos);
    setObservacionesEdit(obs);
    setOperadorEdit(operadorUnificado);
  };

  const handleDanoToggleEdit = (id) => {
    setSelectedDanosEdit(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleObsChangeEdit = (id, text) => {
    setObservacionesEdit(prev => ({ ...prev, [id]: text }));
  };

  const guardarEdicionAvanzada = async () => {
    if (!camionEditando) return;

    let operadorFinal = '';
    const finalFallasItems = [];
    let totalPuntos = 0;
    const detallesFinales = camionEditando.detalles_grupos ? { ...camionEditando.detalles_grupos } : {};

    if (editingGroupContext === 'General') {
      operadorFinal = operadorEdit || '';
      Object.keys(selectedDanosEdit).forEach(fId => {
        if (selectedDanosEdit[fId]) {
          const fallObj = fallas.find(f => f.id === fId);
          if (fallObj) {
            totalPuntos += fallObj.impacto;
            const obsLimpia = corregirOrtografiaIA(observacionesEdit[fId] || '');
            const obs = obsLimpia ? ` (${obsLimpia})` : '';
            finalFallasItems.push(`${fallObj.nombre}${obs}`);
          }
        }
      });
    } else {
      const fallasStruct = {};
      Object.keys(selectedDanosEdit).forEach(id => {
        if (selectedDanosEdit[id]) fallasStruct[id] = corregirOrtografiaIA(observacionesEdit[id] || '');
      });

      if (!detallesFinales[editingGroupContext]) {
        detallesFinales[editingGroupContext] = {
           supervisor: session.nombre,
           mina: camionEditando.mina,
           time: new Date().toLocaleString()
        };
      }
      detallesFinales[editingGroupContext].operador = operadorEdit;
      detallesFinales[editingGroupContext].fallas = fallasStruct;

      const opsSet = new Set();
      (camionEditando.operador || '').split(/\s*,\s*/).forEach(o => {
          const gMatch = o.match(/^(G\d+|General)\s*[:\-]/i);
          if (!gMatch) opsSet.add(o.trim()); // Guardar legacy puro sin etiqueta
          else if (!detallesFinales[gMatch[1].toUpperCase()]) opsSet.add(o.trim()); // Legacy con etiqueta que no esté en el JSON
      });
      Object.keys(detallesFinales).forEach(g => {
          if (detallesFinales[g].operador) opsSet.add(`${g}: ${detallesFinales[g].operador}`);
      });
      operadorFinal = Array.from(opsSet).filter(Boolean).sort().join(' | ');

      const fallasMap = {};
      if (camionEditando.fallas) {
          const rawFallas = camionEditando.fallas;
          const parts = [];
          let depth = 0; let lastSplit = 0;
          for (let i = 0; i < rawFallas.length; i++) {
              if (rawFallas[i] === '(') depth++;
              if (rawFallas[i] === ')') depth--;
              if (depth === 0 && rawFallas[i] === ',') {
                  parts.push(rawFallas.substring(lastSplit, i).trim());
                  lastSplit = i + 1;
              }
          }
          parts.push(rawFallas.substring(lastSplit).trim());
          parts.forEach(p => {
              if (!p || p === '-') return;
              const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
              if (match) {
                  const nombre = match[1].trim();
                  const combined = match[2] || '';
                  if (!fallasMap[nombre]) fallasMap[nombre] = {};
                  if (combined) {
                      combined.split(/\s*[|/]\s*/).forEach(seg => {
                          const gMatch = seg.match(/^(G\d+|General)\s*[:\-]\s*(.*)$/i);
                          if (gMatch && !detallesFinales[gMatch[1].toUpperCase()]) {
                              fallasMap[nombre][gMatch[1].toUpperCase()] = gMatch[2] || '';
                          } else if (!gMatch) {
                              fallasMap[nombre]['General'] = seg;
                          }
                      });
                  }
              }
          });
      }

      Object.keys(detallesFinales).forEach(g => {
          const gFallas = detallesFinales[g].fallas;
          if (gFallas) {
              Object.keys(gFallas).forEach(fId => {
                  const fallObj = fallas.find(f => f.id === fId);
                  if (fallObj) {
                      if (!fallasMap[fallObj.nombre]) fallasMap[fallObj.nombre] = {};
                      fallasMap[fallObj.nombre][g] = gFallas[fId] || '';
                  }
              });
          }
      });

      const uniqueFallas = new Set();
      Object.keys(fallasMap).forEach(fNome => {
          const fObj = fallas.find(f => f.nombre === fNome);
          if (fObj) {
              uniqueFallas.add(fObj.id);
              const obsMap = fallasMap[fNome];
              const segments = [];
              if (obsMap['General']) segments.push(obsMap['General']);
              ['G1', 'G2', 'G3'].forEach(g => {
                  if (obsMap.hasOwnProperty(g)) {
                      const note = obsMap[g];
                      segments.push(note ? `${g}: ${note}` : g);
                  }
              });
              
              if (segments.length > 0) {
                  finalFallasItems.push(`${fNome} (${segments.join(' | ')})`);
              } else {
                  finalFallasItems.push(`${fNome}`);
              }
          }
      });
      
      Array.from(uniqueFallas).forEach(id => {
          const f = fallas.find(x => x.id === id);
          if (f) totalPuntos += f.impacto;
      });
    }

    const atencion = totalPuntos > 50 ? 'CRÍTICA' : totalPuntos > 20 ? 'ALTA' : 'NORMAL';

    const camionActualizado = {
      operador: operadorFinal,
      fallas: finalFallasItems.join(' | '),
      puntos: totalPuntos,
      atencion: atencion,
      dictamen_tecnico: dictamenEdit,
      detalles_grupos: detallesFinales
    };

    const { error } = await supabase.from('camiones').update(camionActualizado).eq('id', camionEditando.id);

    if (error) return alert("Error al actualizar: " + error.message);

    setCamionesRegistrados(prev => prev.map(c => c.id === camionEditando.id ? {
      ...c,
      ...camionActualizado
    } : c));

    setCamionEditando(null);
    addToast("✅ Edición avanzada guardada y prioridad recalculada.");
  };

  // ---------- FUNCIONES DE EXPORTACIÓN (REPORTES) ----------

  const exportarAExcel = () => {
    if (registrosFiltrados.length === 0) {
      return addToast("No hay datos filtrados para exportar.", "error");
    }

    try {
      addToast("⏳ Preparando archivo Excel...", "info");

      const datosExcel = registrosFiltrados.map(r => {
        // Extracción de datos desde JSONB (v2.1.0)
        const dG = r.detalles_grupos || {};
        
        const getOp = (g) => dG[`G${g}`]?.operador || (r.operador || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';
        const getSup = (g) => dG[`G${g}`]?.supervisor || (r.supervisor || '').split(', ').find(n => n.includes(`G${g}:`))?.replace(`G${g}:`, '').trim() || '-';
        
        // Cálculo de Tiempo de Ciclo
        let cicloTxt = '-';
        if (r.finalizado_at && (r.ingreso_evaluar_at || r.creado_at)) {
          const inicio = new Date(r.ingreso_evaluar_at || r.creado_at);
          const fin = new Date(r.finalizado_at);
          const diffMs = fin - inicio;
          const diffMin = Math.max(0, Math.floor(diffMs / 60000));
          const horas = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          cicloTxt = horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;
        }

        return {
          "Fecha Reporte": r.time,
          "Flota": r.flota,
          "Mina/Ubicación": r.mina,
          "Atención/Prioridad": r.atencion || 'NORMAL',
          "Op. Grupo 1": getOp(1),
          "Sup. Grupo 1": getSup(1),
          "Op. Grupo 2": getOp(2),
          "Sup. Grupo 2": getSup(2),
          "Op. Grupo 3": getOp(3),
          "Sup. Grupo 3": getSup(3),
          "Fallas Unificadas": r.fallas,
          "Ciclo de Tiempo": cicloTxt,
          "Fecha Liberación": r.finalizado_at ? new Date(r.finalizado_at).toLocaleString() : '-',
          "Estado G1": r.aprobado_g1 ? 'Aprobado' : '-',
          "Estado G2": r.aprobado_g2 ? 'Aprobado' : '-',
          "Estado G3": r.aprobado_g3 ? 'Aprobado' : '-'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Mantenimiento");
      XLSX.writeFile(workbook, `Historial_Drummond_Confort_${new Date().toLocaleDateString()}.xlsx`);
      addToast("✅ Excel descargado con éxito.");
    } catch (error) {
      addToast("❌ Error al generar Excel: " + error.message, "error");
    }
  };

  const generarPDF = async (registro) => {
    try {
      const grupoActual = session.grupo || '1';
      const grupoPrefix = `G${grupoActual}:`;
      const opNames = (registro.operador || '').split(', ');
      
      // Verificamos si el grupo actual ya tiene un operador registrado
      const yaTieneOperador = opNames.some(n => n.includes(grupoPrefix));

      if (!yaTieneOperador) {
        // ACTIVACIÓN DE RECEPCIÓN MULTIGRUPO
        showConfirm({
          type: 'prompt',
          title: `Recepción de Camión (Grupo ${grupoActual})`,
          message: `El Camión ${registro.flota} está siendo recibido por un grupo distinto al reporte original.\n\nPor favor, ingrese el nombre del Operador que RECIBE el camión en el Grupo ${grupoActual}:`,
          placeholder: 'Nombre del Operador Receptor...',
          confirmText: 'Registrar y Generar PDF',
          onConfirm: async (nombreIngresado) => {
            if (!nombreIngresado || nombreIngresado.trim().length < 3) {
              return addToast("❌ Nombre de operador inválido.", "error");
            }
            
            try {
              addToast("💾 Guardando trazabilidad de recepción...", "info");
              const nuevoOpInfo = `${grupoPrefix} ${nombreIngresado.trim()}`;
              const nuevoSupInfo = `${grupoPrefix} ${session.nombre || 'Supervisor'}`;
              
              const updateData = {
                operador: registro.operador ? `${registro.operador}, ${nuevoOpInfo}` : nuevoOpInfo,
                supervisor: registro.supervisor ? `${registro.supervisor}, ${nuevoSupInfo}` : nuevoSupInfo
              };

              // Persistencia en Supabase
              const { error } = await supabase.from('camiones').update(updateData).eq('id', registro.id);
              if (error) throw error;

              // Actualización de estado local para que el PDF salga con la data nueva
              const registroActualizado = { ...registro, ...updateData };
              setCamionesRegistrados(prev => prev.map(c => c.id === registro.id ? registroActualizado : c));
              
              // Proceder a renderizar el PDF con el registro actualizado
              renderizarPDF(registroActualizado);
            } catch (err) {
              addToast("❌ Error al guardar datos de recepción: " + err.message, "error");
            }
          }
        });
      } else {
        // Si el grupo ya participó, generamos el PDF directamente
        renderizarPDF(registro);
      }
    } catch (err) {
      addToast("❌ Error al iniciar generación de PDF: " + err.message, "error");
    }
  };

  const renderizarPDF = (registro) => {
    try {
      addToast("⏳ Generando acta de trazabilidad...", "info");
      const doc = new jsPDF();

      // === CABECERA PREMIUM MINIMALISTA (v1.9.97) ===
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'F'); // Badge ultra-compacto
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(160, 10, 35, 16, 3, 3, 'D');

      try {
        if (typeof LOGO_DRUMMOND !== 'undefined' && LOGO_DRUMMOND) {
          // v1.9.101 Blindaje de Logo: Aseguramos prefijo para jsPDF
          const logoData = LOGO_DRUMMOND.startsWith('data:') ? LOGO_DRUMMOND : `data:image/png;base64,${LOGO_DRUMMOND}`;
          doc.addImage(logoData, 'PNG', 15, 8, 28, 20);
        }
      } catch (e) {
        console.error("Error al cargar logo:", e);
      }

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ACTA DE TRAZABILIDAD", 65, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CONFORT CAMIONES", 65, 26);

      // Info Badge Compacto
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("MINA:", 163, 16);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.mina === 'PB' ? 'PB' : 'ED'}`, 174, 16);
      
      doc.setFont("helvetica", "bold");
      doc.text("CAMIÓN:", 163, 22);
      doc.setFont("helvetica", "normal");
      doc.text(`${registro.flota}`, 177, 22);

      // Cuerpo del Reporte
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 145, 32);

      doc.setFont("helvetica", "bold");
      doc.text(`Personal que reporta el estado (Operadores Permanentes):`, 20, 45);
      doc.setFont("helvetica", "normal");
      
      // Filtrar para mostrar solo al reportero original (v2.1.0)
      const dG_orig = registro.detalles_grupos || {};
      const origG = registro.grupo || '1';
      const reporteroData = dG_orig[`G${origG}`] || {};
      
      const operText = reporteroData.operador || (registro.operador || 'N/A').split(', ').find(n => n.includes(`G${origG}:`)) || (registro.operador || 'N/A').split(', ')[0];
      
      const operSplit = doc.splitTextToSize(operText, 170);
      doc.text(operSplit, 20, 52);

      const supLabelY = 52 + (operSplit.length * 5) + 2;
      doc.setFont("helvetica", "bold");
      doc.text(`Gestor del reporte (Supervisor de Camiones):`, 20, supLabelY);

      doc.setFont("helvetica", "normal");
      const supText = reporteroData.supervisor || (registro.supervisor || 'N/A').split(', ').find(n => n.includes(`G${origG}:`)) || (registro.supervisor || 'N/A').split(', ')[0];
      
      const supSplit = doc.splitTextToSize(supText, 170);
      const supDataY = supLabelY + 7;
      doc.text(supSplit, 20, supDataY);

      const tableY = Math.max(85, supDataY + (supSplit.length * 5) + 5);

      const tableFunc = typeof autoTable === 'function' ? autoTable : autoTable.default;
      const itemsFallas = limpiarFallasIA(registro.fallas);
      const bodyFallas = itemsFallas.map(item => [item.falla, item.obs]);

      tableFunc(doc, {
        startY: tableY,
        head: [['Detalle de Fallas Intervenidas', 'Comentarios Técnica / Observación']],
        body: bodyFallas,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } }
      });

      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORIAL DE VALIDACIÓN POR GRUPOS", 20, finalY);

      tableFunc(doc, {
        startY: finalY + 10,
        head: [['Grupo de Turno', 'Visto Bueno (VB)', 'Estado']],
        body: [
          ['Grupo 1', registro.aprobado_g1 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g1 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
          ['Grupo 2', registro.aprobado_g2 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g2 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
          ['Grupo 3', registro.aprobado_g3 ? 'CONFIRMADO' : 'N/A', registro.aprobado_g3 ? 'Aceptada a Satisfacción' : 'Sin intervención'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
      });

      const dG = registro.detalles_grupos || {};
      const grupoActual = session.grupo || '1';
      const opNameFiltered = dG[`G${grupoActual}`]?.operador || (registro.operador || '').split(', ').find(n => n.includes(`G${grupoActual}:`))?.replace(`G${grupoActual}:`, '').trim() || 'N/A';

      const signY = doc.lastAutoTable.finalY + 35;
      
      doc.setDrawColor(0);
      doc.line(20, signY, 85, signY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${opNameFiltered}`, 20, signY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Operador de Camion", 20, signY + 10);
      doc.text(`Grupo ${grupoActual}`, 20, signY + 15);

      doc.line(120, signY, 185, signY);
      doc.setFont("helvetica", "bold");
      doc.text(`${session.nombre || 'Supervisor'}`, 120, signY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(`Supervisor de Camiones`, 120, signY + 10);
      doc.text(`Drummond Ltd.`, 120, signY + 15);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Documento generado digitalmente por Drummond Confort System`, 105, 285, { align: 'center' });

      doc.save(`Acta_Trazabilidad_${registro.flota}_${new Date().toISOString().split('T')[0]}.pdf`);
      addToast(`✅ PDF del camión ${registro.flota} generado.`);
    } catch (err) {
      addToast("❌ Error al producir PDF: " + err.message, "error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Lógica Funcional del Módulo de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (usuarioLogin && passwordLogin) {
      const usernameReq = usuarioLogin.toLowerCase().trim();

      // Conexión Oficial con Servidor Supabase
      const { data: usuarioSupabase, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', usernameReq)
        .eq('password', passwordLogin)
        .single();

      if (error || !usuarioSupabase) {
        return alert(`❌ Credenciales incorrectas. Verifique el usuario "${usernameReq}" y su contraseña en el servidor de Drummond.`);
      }

      const usuarioActivo = usuarioSupabase;

      if (usuarioActivo.estado === 'Inactivo') {
        return alert(`❌ ACCESO DENEGADO: La cuenta "${usernameReq}" figura como INACTIVA, consulte con el Administrador del Sistema.`);
      }

      if (usuarioActivo.firstTime) {
        // Requiere forzar el cambio de clave por políticas operativas
        setPendingPasswordChangeUser(usuarioActivo);
        return;
      }

      const nuevaSesion = {
        user: { username: usernameReq },
        role: usuarioActivo.role,
        mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
        grupo: usuarioActivo.grupo || '1',
        nombre: usuarioActivo.nombre,
        id: usuarioActivo.id
      };
      setSession(nuevaSesion);
      localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
      setActiveTab('dashboard'); // Forzar render
    } else {
      alert("Por favor ingrese usuario y contraseña.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 5) {
      return alert("La contraseña debe ser de al menos 5 caracteres de seguridad.");
    }
    if (newPassword !== confirmPassword) {
      return alert("⚠️ Las contraseñas no coinciden. Por favor, asegúrate de escribirlas idénticas.");
    }

    // Actualizamos al usuario en la Nube
    const { error } = await supabase.from('usuarios')
      .update({ password: newPassword, firstTime: false })
      .eq('id', pendingPasswordChangeUser.id);

    if (error) return addToast("Error al actualizar contraseña: " + error.message, "error");

    // Se realiza el setSession para pasar adelante
    const usuarioActivo = { ...pendingPasswordChangeUser, password: newPassword, firstTime: false };
    const nuevaSesion = {
      user: { username: usuarioActivo.username },
      role: usuarioActivo.rol,
      mina: usuarioActivo.mina === 'Ambas' || usuarioActivo.mina === 'Global' ? 'Global' : usuarioActivo.mina,
      nombre: usuarioActivo.nombre,
      id: usuarioActivo.id
    };
    setSession(nuevaSesion);
    localStorage.setItem('drummond_session', JSON.stringify(nuevaSesion));
    setActiveTab('dashboard'); // Forzar ir al panel seguro

    setPendingPasswordChangeUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setUsuarioLogin('');
    setPasswordLogin('');
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('drummond_session');
    sessionStorage.removeItem('drummond_activeTab');
    localStorage.removeItem('drummond_report_form');
    setUsuarioLogin('');
    setPasswordLogin('');
    setPendingPasswordChangeUser(null);
    setActiveTab('dashboard'); // Limpiar vista bloqueada
  };

  // Si no hay sesión activa, bloqueamos el acceso y mostramos el Login
  if (!session) {
    if (pendingPasswordChangeUser) {
      // PANTALLA CAMBIO CONTRASEÑA OBLIGATORIO
      return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fade-in" style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ background: '#fef2f2', width: '60px', height: '60px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444', fontSize: '1.5rem' }}>🔐</div>
              <h1 style={{ color: '#1f2937', margin: 0, fontSize: '1.4rem' }}>Actualización Requerida</h1>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>Hola, <b>{pendingPasswordChangeUser.nombre}</b>. Por políticas de seguridad, debes registrar una nueva clave antes de ingresar al sistema.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="input-group">
                <label className="input-label">📝 Define tu Nueva Contraseña</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Mínimo 5 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ border: '2px solid #3b82f6' }}
                  required
                />
              </div>
              <div className="input-group" style={{ marginTop: '-0.5rem' }}>
                <label className="input-label">Confirma tu Contraseña</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Escríbela de nuevo idéntica"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ border: '2px solid #3b82f6' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: '#2563eb', borderColor: '#2563eb' }}>
                Actualizar y Acceder
              </button>
            </form>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#ef4444', margin: 0, fontSize: '1.8rem', letterSpacing: '-1px' }}>DRUMMOND</h1>
            <p style={{ color: '#1f2937', fontWeight: 'bold', margin: '0.2rem 0', fontSize: '1.2rem' }}>Programa de Confort Camiones</p>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Plataforma Interna Asegurada</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="input-group">
              <label className="input-label">Usuario</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ejemplo: jperez"
                value={usuarioLogin}
                onChange={e => setUsuarioLogin(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} // Solo alfanuméricos
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={passwordLogin}
                onChange={e => setPasswordLogin(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              🔒 Ingresar al Sistema
            </button>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
              El estado de conexión en vivo con Supabase está pendiente de API keys.
            </p>
          </form>
        </div>
      </div>
    );
  }



  // Blindaje de Seguridad: Solo calcular si hay sesión activa
  // Lógica de Filtrado Inteligente v1.9.34 (Soporte Meses y Multi-búsqueda)
  const registrosFiltrados = (session && Array.isArray(camionesAccessibles)) ? camionesAccessibles.filter(r => {
    // Solo mostramos los que ya están en el historial (liberados)
    if (r.estado !== 'liberado') return false;
    
    try {
      // Blindaje de Datos (v1.9.51): Conversión segura a String
      const fFlota = String(r.flota || '').toLowerCase();
      const fMina = String(r.mina || '').toLowerCase();
      const fBusquedaFlota = String(filtroFlota || '').toLowerCase();
      const fBusquedaMina = String(filtroMina || '').toLowerCase();

      // Filtro por Flota y Mina
      const matchFlota = fFlota.includes(fBusquedaFlota);
      const matchMina = !fBusquedaMina || fMina === fBusquedaMina;
      if (!matchFlota || !matchMina) return false;

      // Lógica de Filtrado de Alto Nivel v1.9.40 (Rangos e Inteligencia Mensual)
      const busquedaMes = String(filtroMes || '').trim().toLowerCase();
      if (!busquedaMes) return true;
      
      const timeStr = String(r.time || r.creado_at || '');
      if (!timeStr) return false;

      let mesIndex = -1; // 0-indexed (0=Ene, 11=Dic)

      // Extractor de Mes Robusto (Soporte DD/MM/AAAA e ISO)
      if (timeStr.includes('/')) {
        const partes = timeStr.split('/');
        if (partes.length >= 2) mesIndex = parseInt(partes[1], 10) - 1;
      } else if (timeStr.includes('-')) {
        const partes = timeStr.split('-');
        if (partes.length >= 2) {
          // Detectar si es YYYY-MM-DD o DD-MM-YYYY
          mesIndex = partes[0].length === 4 ? parseInt(partes[1], 10) - 1 : parseInt(partes[1], 10) - 1;
        }
      }

      if (mesIndex === -1) return false;

      // Ayudante para normalizar cualquier entrada a índice de mes
      const getMesIndex = (str) => {
        const s = String(str || '').toLowerCase().trim();
        if (!s) return -1;
        const mesesAbbr = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesesFull = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        let idx = mesesAbbr.indexOf(s.substring(0, 3));
        if (idx === -1) idx = mesesFull.indexOf(s);
        if (idx === -1 && /^\d+$/.test(s)) {
          const n = parseInt(s, 10);
          if (n >= 1 && n <= 12) idx = n - 1;
        }
        return idx;
      };

      const terminos = busquedaMes.split(',').map(t => t.trim()).filter(Boolean);
      
      return terminos.some(t => {
        if (t.includes('-')) {
          const puntos = t.split('-').map(p => p.trim());
          if (puntos.length === 2) {
            const start = getMesIndex(puntos[0]);
            const end = getMesIndex(puntos[1]);
            if (start !== -1 && end !== -1) {
              return mesIndex >= start && mesIndex <= end;
            }
          }
        }
        const tIdx = getMesIndex(t);
        return tIdx !== -1 && tIdx === mesIndex;
      });
    } catch (err) {
      console.error("Error en filtro de historial:", err);
      return true;
    }
  }).sort((a, b) => {
    const timeA = a.finalizado_at ? new Date(a.finalizado_at).getTime() : 0;
    const timeB = b.finalizado_at ? new Date(b.finalizado_at).getTime() : 0;
    return timeB - timeA;
  }) : [];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo-container">
            <div className="brand-logo-text">CAMIONES</div>
            <div className="brand-subtitle">PRODUCCIÓN</div>
          </div>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Dashboard Principal
          </div>
          <div
            className={`nav-item ${activeTab === 'nuevo' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('nuevo');
              // Automatización de Datos por Usuario (v1.6.0)
              if (session?.role !== 'admin') {
                setMina(session?.mina === 'Global' ? mina : session?.mina);
                setGrupo(session?.grupo);
              }
            }}
          >
            <PlusCircle size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Nuevo Reporte
          </div>
          <div
            className={`nav-item ${activeTab === 'cola' ? 'active' : ''}`}
            onClick={() => setActiveTab('cola')}
          >
            <Blocks size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Pila de Mantenimiento
          </div>
          <div className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            <ClipboardList size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Historial Analítico
          </div>
          {session?.role === 'admin' && (
            <div className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <Settings size={18} style={{ marginRight: '0.6rem', marginBottom: '-0.15rem' }} /> Gestor de Cuentas
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {session?.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{session?.nombre || 'Usuario'}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Mina {session?.mina || 'N/A'}</div>
            </div>
          </div>
          <button
            style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Panel de Control - Confort'}
            {activeTab === 'nuevo' && 'Nuevo Reporte'}
            {activeTab === 'cola' && 'Cola de Priorización Taller'}
            {activeTab === 'historial' && 'Historial de Mantenimientos'}
          </h1>
          <div className="user-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700' }}>{session?.nombre || 'Usuario'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {session?.mina || 'N/A'}</div>
              </div>
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%', backgroundColor: '#ef4444',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold'
              }}>
                {(session?.nombre || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-black)', margin: 0 }}><LayoutDashboard strokeWidth={1.5} size={24} style={{ marginBottom: '-0.3rem', color: '#2563eb' }} />  Resumen de Control</h2>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <span className="badge dashboard-kpi-badge" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #6366f1', background: 'rgba(99, 102, 241, 0.15)', color: '#4f46e5', boxShadow: '0 2px 4px rgba(99, 102, 241, 0.1)' }}>
                  <Zap size={16} strokeWidth={2} /> <span>Ciclo Promedio: <strong>{calcularPromedioCiclo()}</strong></span>
                </span>
                <span className="badge badge-liberado dashboard-kpi-badge" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
                  <Award size={16} strokeWidth={2} /> <span>Entregados: <strong>{conteoLiberados}</strong></span>
                </span>
              </div>
            </div>
            <div className="kpi-grid">
              {kpis.map(k => (
                <div key={k.id} className="kpi-card" style={{ borderTopColor: k.color }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', alignItems: 'center' }}>
                    {k.titulo}
                    <span style={{ color: k.color }}>{k.icon}</span>
                  </div>
                  <div className="kpi-value">{k.valor}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{k.subtitulo}</div>
                </div>
              ))}
            </div>

            <div className="card fade-in" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Zap size={22} color="var(--primary-red)" /> Top Prioridades en Taller
                </h3>
                <button className="btn btn-primary mobile-only" onClick={() => setActiveTab('cola')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Ver Todos</button>
              </div>

              <div className="priority-view-container">
                {/* Vista exclusiva para PC: Tabla Moderna */}
                {window.innerWidth > 768 ? (
                  <div className="table-responsive">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Camión</th>
                          <th>Mina / Grupo</th>
                          <th>Atención Requerida</th>
                          <th>Estado</th>
                          <th>Fecha Reporte</th>
                          <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(camionesAccessibles || [])
                          .filter(c => c && c.estado !== 'liberado')
                          .sort((a, b) => {
                            const pesos = { 'CRÍTICA': 3, 'ALTA': 2, 'NORMAL': 1 };
                            return (pesos[b.atencion] || 0) - (pesos[a.atencion] || 0);
                          })
                          .slice(0, 6)
                          .map((camion) => (
                          <tr key={camion?.id || Math.random()}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <strong style={{ fontSize: '1.10rem' }}>{camion?.flota || 'S/N'}</strong>
                                <button
                                  onClick={() => setSelectedReport(camion)}
                                  style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                                  title="Ver Diagnóstico Técnico"
                                >
                                  <FileText size={16} />
                                </button>
                              </div>
                            </td>
                            <td>{camion?.mina || '--'} / {formatGrupo(camion?.grupo)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {camion?.atencion === 'CRÍTICA' && <><Siren size={20} color="#ef4444" strokeWidth={2} /><strong>CRÍTICA</strong></>}
                                {camion?.atencion === 'ALTA' && <><AlertTriangle size={20} color="var(--secondary-yellow)" strokeWidth={2} /><strong>ALTA</strong></>}
                                {camion?.atencion === 'NORMAL' && <><CheckCircle2 size={20} color="#10b981" strokeWidth={2} /><strong>NORMAL</strong></>}
                              </div>
                            </td>
                            <td><span className={`badge badge-${camion?.estado || 'default'}`}>{(camion?.estado || 'N/A').toUpperCase()}</span></td>
                            <td>{formatFechaCorta(camion?.time || camion?.creado_at)}</td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                                {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'supervisor' || session?.rol?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'supervisor') && (
                                  <button onClick={() => prepararEdicion(camion)} className="btn-action btn-action-edit" title="Editar"><Edit3 size={18} /></button>
                                )}
                                {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'admin') && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSafeDelete(camion.id, () => eliminarCamion(camion.id, camion.flota)); }} 
                                    className={`btn-action ${confirmDeleteId === camion.id ? 'btn-action-confirm-desktop' : 'btn-action-delete'}`}
                                    style={{ 
                                      width: confirmDeleteId === camion.id ? 'auto' : '36px',
                                      padding: confirmDeleteId === camion.id ? '0.5rem 1rem' : '0'
                                    }}
                                    title="Eliminar"
                                  >
                                    {confirmDeleteId === camion.id ? <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>✓ CONFIRMAR</span> : <Trash2 size={18} />}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vista exclusiva para Móvil: Tarjetas Modernas */
                  <div className="priority-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {(camionesAccessibles || []).filter(c => c && c.estado !== 'liberado').slice(0, 6).map((camion) => (
                      <div key={camion?.id || Math.random()} className="kanban-card card-overlay" style={{ background: 'white', borderRadius: '12px', padding: '1rem', borderLeft: `6px solid ${camion?.atencion === 'CRÍTICA' ? '#ef4444' : (camion?.atencion === 'ALTA' ? 'var(--secondary-yellow)' : '#10b981')}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-black)' }}>CAMIÓN {camion?.flota || 'S/N'}</span>
                            {camion?.motivo_garantia && <ShieldAlert size={16} color="#ef4444" className="pulse-slow" />}
                          </div>
                          <span className={`badge badge-${camion?.estado || 'default'}`} style={{ fontSize: '0.65rem' }}>{(camion?.estado || 'N/A').toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Mina/Grupo:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{camion?.mina || '--'} / {formatGrupo(camion?.grupo)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Prioridad:</span>
                            <strong style={{ color: camion?.atencion === 'CRÍTICA' ? '#ef4444' : 'var(--text-main)' }}>{camion?.atencion || 'NORMAL'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ingreso:</span>
                            <strong style={{ color: 'var(--secondary-blue)' }}>{formatFechaCorta(camion?.time || camion?.creado_at)}</strong>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => setSelectedReport(camion)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '0.3rem', borderRadius: '6px' }} title="Diagnóstico"><FileText size={16} /></button>
                          {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'supervisor' || session?.rol?.toLowerCase() === 'admin' || session?.rol?.toLowerCase() === 'supervisor') && (
                            <button onClick={() => prepararEdicion(camion)} style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e5e7eb', color: '#6b7280', padding: '0.3rem', borderRadius: '6px' }} title="Editar"><Edit3 size={16} /></button>
                          )}
                          {(session?.role?.toLowerCase() === 'admin' || session?.role?.toLowerCase() === 'admin') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSafeDelete(camion.id, () => eliminarCamion(camion.id, camion.flota)); }} 
                              style={{ 
                                background: confirmDeleteId === camion.id ? 'var(--primary-red)' : 'rgba(239, 68, 68, 0.1)', 
                                border: confirmDeleteId === camion.id ? 'none' : '1px solid rgba(239, 68, 68, 0.2)',
                                color: confirmDeleteId === camion.id ? 'white' : '#ef4444', 
                                padding: '0.3rem', 
                                borderRadius: '6px',
                                minWidth: confirmDeleteId === camion.id ? '80px' : '32px',
                                transition: 'all 0.3s ease'
                              }} 
                              title="Eliminar"
                            >
                              {confirmDeleteId === camion.id ? <span style={{ fontSize: '0.6rem', fontWeight: '900' }}>¿BORRAR?</span> : <Trash2 size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board View */}
        {activeTab === 'cola' && (
          <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="kanban-title-stack" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary-black)', margin: '0 0 0.4rem 0', lineHeight: '1.2' }}>🔧 Pila de Mantenimiento (Control Taller)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Arrastra los camiones para avanzar su estado</span>
            </div>

            <div className="kanban-headers fade-in" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {columnasKanban.map(col => (
                <div key={col.id} className="kanban-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: col.color, borderRadius: '50%' }}></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.titulo} {col.icon && <span style={{ color: col.color }}>{col.icon}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="kanban-board"
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                // Calculamos el índice basado en el ancho de la columna 72vw + gap
                const index = Math.round(scrollLeft / (width * 0.75)); 
                if (index >= 0 && index <= 5) setCurrentKanbanCol(index);
              }}
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                flex: 1,
                alignItems: 'flex-start',
                scrollSnapType: 'x mandatory'
              }}
            >
              {columnasKanban.map(col => {
                const camionesColumna = camionesAccessibles.filter(c => c.estado === col.id).sort((a, b) => b.puntos - a.puntos);

                return (
                  <div
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="kanban-column"
                    style={{
                      borderTop: `4px solid ${col.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <strong style={{ color: 'var(--primary-black)' }}>{col.titulo}</strong>
                      <span className="badge" style={{ background: 'white', color: 'var(--primary-black)', borderRadius: '50px' }}>
                        {camionesColumna.length}
                      </span>
                    </div>

                    {camionesColumna.map((camion, index) => {
                      const shouldStack = camionesColumna.length > 1 && index > 0;
                      const isExpanded = expandedCardId === camion.id || camionesColumna.length === 1;
                      const marginTop = isExpanded ? '0' : (shouldStack ? '-1.2rem' : '0.5rem');
                      return (
                      <div 
                        key={camion.id}
                        className="kanban-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, camion.id)}
                        style={{
                          borderLeft: `4px solid ${camion.atencion === 'CRÍTICA' ? '#ef4444' : camion.atencion === 'ALTA' ? 'var(--secondary-yellow)' : '#10b981'}`,
                          marginTop: marginTop,
                          zIndex: isExpanded ? 1000 : index + 1
                        }}
                      >
                        <div 
                          className="kanban-card-header"
                          onClick={() => setExpandedCardId(expandedCardId === camion.id ? null : camion.id)}
                          style={{ 
                            padding: '0.6rem 0.6rem', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            alignItems: 'center', 
                            gap: '0.3rem'
                          }}
                        >
                          <Truck size={17} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                          <strong style={{ fontSize: '1.15rem', color: 'var(--primary-black)', marginRight: '0.2rem', flexShrink: 0 }}>{camion.flota}</strong>
                          
                          {/* El icono de garantía se movió al botón de Diagnóstico para ganar espacio arriba */}
                          
                          {camion.consenso > 1 && (
                            <div title={`Consenso de ${camion.consenso} grupos`} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.3rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', border: '1px solid #dbeafe', flexShrink: 0 }}>
                              <Users size={11} /> {camion.consenso}
                            </div>
                          )}
                          
                          {camion.atencion === 'CRÍTICA' && <Siren size={17} color="#ef4444" strokeWidth={2} style={{ flexShrink: 0 }} />}
                          {camion.atencion === 'ALTA' && <AlertTriangle size={17} color="#eab308" strokeWidth={2} style={{ flexShrink: 0 }} />}
                          {camion.atencion === 'NORMAL' && <CheckCircle2 size={17} color="#10b981" strokeWidth={2} style={{ flexShrink: 0 }} />}
                        </div>

                        {isExpanded && (
                          <div className="fade-in">
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                              Ingreso: {formatFechaCorta(camion.time || camion.creado_at)}
                            </div>
                            
                            <button
                              onClick={() => setSelectedReport(camion)}
                              className="btn btn-secondary"
                              style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <MonitorCheck size={16} />
                                {camion.motivo_garantia && <ShieldAlert size={16} color="#ef4444" className="pulse-slow" />}
                              </div>
                              <span style={{ marginLeft: '0.2rem' }}>Diagnóstico</span>
                            </button>

                            {/* Restaurando Botón de Pendientes de Garantía */}
                            {camion.estado === 'garantia' && camion.motivo_garantia && (
                              <button
                                onClick={() => setSelectedGarantiaDetails(camion)}
                                style={{ width: '100%', marginBottom: '0.6rem', padding: '0.5rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <ShieldAlert size={16} /> Pendientes
                              </button>
                            )}

                            {camion.estado === 'evaluados' && (
                              <button
                                onClick={() => prepararDictamen(camion)}
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#7c3aed', border: 'none' }}
                              >
                                <ShieldCheck size={16} /> Dictamen Técnico
                              </button>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Prioridad:</span>
                              <span className="badge" style={{
                                background: 'white',
                                color: camion.atencion === 'CRÍTICA' ? '#ef4444' : 'var(--text-muted)',
                                border: '1px solid #e5e7eb'
                              }}>
                                {camion.atencion}
                              </span>
                            </div>

                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Mover a:</label>
                              <select 
                                value={camion.estado}
                                onChange={(e) => {
                                  const evt = { preventDefault: () => { }, dataTransfer: { getData: () => camion.id.toString() } };
                                  handleDrop(evt, e.target.value);
                                }}
                                className="input-field"
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                              >
                                {columnasKanban.map(opts => (
                                  <option key={opts.id} value={opts.id}>{opts.titulo.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '')}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}

                    {camionesColumna.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Vacío
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="kanban-indicators mobile-only">
              {columnasKanban.map((_, i) => (
                <div key={i} className={`indicator-dot ${currentKanbanCol === i ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        )}

        {/* Historial View */}
        {activeTab === 'historial' && (
          <div className="card fade-in">
            <div className="history-header-container">
              <div className="history-title-area">
                <h2 style={{ marginBottom: '0.2rem', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ClipboardList size={22} strokeWidth={2} style={{ color: 'var(--secondary-blue)' }} /> Historial de Mantenimientos
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Registro histórico de camiones de confort completamente solucionados.</p>
              </div>
              <div className="history-header-actions">
                <span className="badge badge-liberado history-badge" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}>
                  <Award size={16} strokeWidth={2} /> <span>Camiones Entregados: <strong>{conteoLiberados}</strong></span>
                </span>
                <button
                  className="btn btn-primary history-export-btn"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                  onClick={exportarAExcel}
                >
                  <FileSpreadsheet size={18} strokeWidth={2} /> Exportar a Excel
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Search size={16} strokeWidth={1.5} /> Camión:</span>
                <input
                  type="text"
                  className="input-field"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minWidth: '130px', background: 'rgba(255, 255, 255, 0.5)' }}
                  placeholder="Ej: 2410"
                  value={filtroFlota}
                  onChange={(e) => setFiltroFlota(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} strokeWidth={1.5} /> Mina:</span>
                <select
                  className="input-field"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.5)' }}
                  value={filtroMina}
                  onChange={(e) => setFiltroMina(e.target.value)}
                >
                  <option value="">Todas las Minas</option>
                  <option value="PB">Pribbenow (PB)</option>
                  <option value="ED">El Descanso (ED)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} strokeWidth={1.5} /> Mes Salida:</span>
                <input
                  type="text"
                  className="input-field"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', minWidth: '130px', background: 'white' }}
                  placeholder="Ej: Feb, Mar"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px', whiteSpace: 'nowrap' }}>Camión</th>
                    <th style={{ minWidth: '220px', width: '280px' }}>Fallas Reparadas</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Ingreso a Fila</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Liberación</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Tiempo de Ciclo</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Operador</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Mina</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Aprobado</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Reporte</th>
                    {session.role === 'admin' && <th className="desktop-only" style={{ textAlign: 'center', width: '80px' }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.length > 0 ? registrosFiltrados.slice(0, registrosLimit).map(registro => {
                    const isExpanded = expandedHistoryId === registro.id;
                    return (
                      <tr 
                        key={registro.id} 
                        className={`history-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => {
                          if (window.innerWidth <= 768) {
                            setExpandedHistoryId(isExpanded ? null : registro.id);
                          }
                        }}
                      >
                        <td data-label="Camión">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
                            <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Camión</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary-black)', marginLeft: 'auto' }}>{registro.flota}</strong>
                          </div>
                        </td>
                        <td data-label="Fallas" className="collapsible-col" style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.3', minWidth: '220px' }}>
                          <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {limpiarFallasIA(registro.fallas).map(f => `${f.falla}${f.obs !== '-' ? ` (${f.obs})` : ''}`).join(' | ')}
                          </div>
                        </td>
                        <td data-label="Ingreso" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.time || registro.creado_at)}</td>
                        <td data-label="Liberación" style={{ fontSize: '0.85rem' }}>{formatFechaCorta(registro.finalizado_at)}</td>
                        <td data-label="Ciclo" className="collapsible-col" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                          {formatearCiclo(registro.time || registro.creado_at, registro.finalizado_at, registro.ingreso_evaluar_at)}
                        </td>
                        <td data-label="Operador" className="collapsible-col" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {(registro.operador || 'N/A').split(/\s*[,|]\s*/).map((op, idx) => {
                              const parts = op.split(': ');
                              const grupoLabel = parts.length > 1 ? parts[0] : '';
                              const nombreOp = parts.length > 1 ? parts[1] : parts[0];
                              return (
                                <div key={idx} style={{
                                  background: 'rgba(99, 102, 241, 0.06)',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  color: 'var(--primary-black)',
                                  fontWeight: '600',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  border: '1px solid rgba(0,0,0,0.03)'
                                }}>
                                  {grupoLabel && <span style={{ color: 'var(--secondary-blue)', fontWeight: 'bold' }}>{grupoLabel}:</span>} {nombreOp}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td data-label="Mina" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mina</span>
                            <div style={{ 
                              background: 'var(--primary-black)', 
                              color: 'white', 
                              padding: '0.25rem 0.8rem', 
                              borderRadius: '50px', 
                              fontSize: '0.75rem', 
                              fontWeight: '900',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                              {registro.mina || 'PB'}
                            </div>
                          </div>
                        </td>
                        <td data-label="Aprobado">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span className="mobile-only" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aprobado</span>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              {registro.aprobado_g1 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G1</span>}
                              {registro.aprobado_g2 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G2</span>}
                              {registro.aprobado_g3 && <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>G3</span>}
                              {(!registro.aprobado_g1 && !registro.aprobado_g2 && !registro.aprobado_g3) && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin V.B</span>}
                            </div>
                          </div>
                        </td>
                        <td data-label="Reporte" className="collapsible-col">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(227, 25, 55, 0.4)', color: 'var(--primary-red)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)', whiteSpace: 'nowrap', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={(e) => { e.stopPropagation(); generarPDF(registro); }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                                <FileText size={15} strokeWidth={1.5} /> Ver PDF
                              </div>
                            </button>
                            
                            {/* Botón Eliminar Protegido para Móviles (v1.9.43) */}
                            {session.role === 'admin' && (
                              <button
                                className={`mobile-only ${confirmDeleteId === registro.id ? 'btn-action-confirm' : ''}`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleSafeDelete(registro.id, () => eliminarCamion(registro.id, registro.flota)); 
                                }}
                                style={{ 
                                  background: confirmDeleteId === registro.id ? 'var(--primary-red)' : 'rgba(239, 68, 68, 0.1)', 
                                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                                  color: confirmDeleteId === registro.id ? 'white' : '#ef4444', 
                                  padding: '0.4rem', 
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s ease',
                                  minWidth: confirmDeleteId === registro.id ? '100px' : '40px'
                                }}
                                title="Eliminar Reporte"
                              >
                                {confirmDeleteId === registro.id ? (
                                  <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>¿BORRAR?</span>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                         {session.role === 'admin' && (
                           <td className="desktop-only" style={{ textAlign: 'center' }}>
                              <button
                                 onClick={(e) => { 
                                   e.stopPropagation(); 
                                   handleSafeDelete(registro.id, () => eliminarCamion(registro.id, registro.flota)); 
                                 }}
                                 className={`btn-action ${confirmDeleteId === registro.id ? 'btn-action-confirm-desktop' : 'btn-action-delete'}`}
                                 style={{ 
                                   margin: '0 auto',
                                   width: confirmDeleteId === registro.id ? 'auto' : '36px',
                                   padding: confirmDeleteId === registro.id ? '0.5rem 1rem' : '0'
                                 }}
                                 title="Eliminar Reporte"
                               >
                                 {confirmDeleteId === registro.id ? (
                                   <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>✓ CONFIRMAR</span>
                                 ) : (
                                   <Trash2 size={18} />
                                 )}
                               </button>
                           </td>
                         )}
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>No hay registros que coincidan con los filtros.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Botón Cargar Más */}
              {registrosFiltrados.length > registrosLimit && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setRegistrosLimit(prev => prev + 20)}
                    style={{ background: 'white', borderColor: 'var(--primary-red)', color: 'var(--primary-red)', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                  >
                    <RefreshCcw size={18} /> Cargar más registros antiguos
                  </button>
                  <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Mostrando {registrosLimit} de {registrosFiltrados.length} registros totales.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Console View: Gestión de Usuarios (Admins only) */}
        {activeTab === 'usuarios' && session.role === 'admin' && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ background: '#eef2ff', padding: '0.7rem', borderRadius: '12px', marginRight: '1rem', color: '#4f46e5' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.4rem' }}>Directorio de Cuentas</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Control estricto de accesos al sistema y asignación a minas.</p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => { setIsCreandoUsuario(!isCreandoUsuario); setUsuarioEditando(null); }}
                style={{ backgroundColor: isCreandoUsuario ? '#6b7280' : 'var(--primary-red)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isCreandoUsuario ? 'Cancelar Formulario' : <><PlusCircle size={16} /> Registrar Operador</>}
              </button>
            </div>

            {/* Formulario de Alta de Usuario */}
            {isCreandoUsuario && (
              <div className="fade-in" style={{ padding: '1.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary-black)' }}>Alta en Base de Datos</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Nombre del Profesional</label>
                    <input type="text" className="input-field" placeholder="ej: Pedro González" value={nuevoUsuarioParams.nombre} onChange={e => {
                      const nuevoNombre = e.target.value;
                      setNuevoUsuarioParams({ ...nuevoUsuarioParams, nombre: nuevoNombre, username: generarAliasBase(nuevoNombre, dbUsuarios) });
                    }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Usuario Login (Generado)</label>
                    <input type="text" className="input-field" placeholder="ej: pgonzalez" value={nuevoUsuarioParams.username} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ background: '#f8fafc', color: '#64748b' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Clave Temporal</label>
                    <input type="text" className="input-field" value="con123" disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Estado de la Cuenta</label>
                    <select className="input-field" value={nuevoUsuarioParams.estado} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, estado: e.target.value })}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Suspendido/Inactivo</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Rol Operativo</label>
                    <select className="input-field" value={nuevoUsuarioParams.role} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, role: e.target.value })}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Fijar Mina a Cargo</label>
                    <select className="input-field" value={nuevoUsuarioParams.mina} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, mina: e.target.value })} disabled={nuevoUsuarioParams.role === 'admin'}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Asignar Grupo</label>
                    <select className="input-field" value={nuevoUsuarioParams.grupo} onChange={e => setNuevoUsuarioParams({ ...nuevoUsuarioParams, grupo: e.target.value })}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={async () => {
                    if (!nuevoUsuarioParams.username || !nuevoUsuarioParams.nombre) return addToast('Por favor, completa nombre y usuario.', 'error');

                    const { data, error } = await supabase.from('usuarios').insert([{
                      nombre: nuevoUsuarioParams.nombre,
                      username: nuevoUsuarioParams.username,
                      password: nuevoUsuarioParams.password,
                      role: nuevoUsuarioParams.role,
                      mina: nuevoUsuarioParams.mina,
                      grupo: nuevoUsuarioParams.grupo,
                      estado: nuevoUsuarioParams.estado,
                      firstTime: true,
                      creado: new Date().toLocaleDateString()
                    }]).select();

                    if (error) return addToast("Error al crear usuario: " + error.message, "error");

                    setDbUsuarios([...dbUsuarios, data[0]]);
                    setIsCreandoUsuario(false);
                    setNuevoUsuarioParams({ nombre: '', username: '', password: 'con123', mina: 'PB', grupo: '1', role: 'supervisor', estado: 'Activo' });
                    addToast('✅ Operador ' + nuevoUsuarioParams.nombre + ' admitido exitosamente.');
                  }}>Crear Acreditación</button>
                </div>
              </div>
            )}

            {/* Formulario de Edición de Usuario */}
            {usuarioEditando && (
              <div className="fade-in" style={{ padding: '1.5rem', background: '#faf5ff', border: '1px solid #e879f9', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#a21caf' }}>✏️ Modificando Ficha Corporativa: @{usuarioEditando.username}</h3>
                  <button onClick={() => setUsuarioEditando(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>❌ Cancelar Edición</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Corregir Nombre</label>
                    <input type="text" className="input-field" value={usuarioEditando.nombre} onChange={e => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Nuevo Usuario Login</label>
                    <input type="text" className="input-field" value={usuarioEditando.username} onChange={e => setUsuarioEditando({ ...usuarioEditando, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() })} style={{ borderColor: '#fbcfe8' }} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Ascender o Reasignar Rol</label>
                    <select className="input-field" value={usuarioEditando.role} onChange={e => setUsuarioEditando({ ...usuarioEditando, role: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                      <option value="supervisor">Supervisor de Producción</option>
                      <option value="lector">Lector KPI (Auditoría)</option>
                      <option value="admin">Administrador TI</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Mina a Cargo</label>
                    <select className="input-field" value={usuarioEditando.mina} onChange={e => setUsuarioEditando({ ...usuarioEditando, mina: e.target.value })} disabled={usuarioEditando.role === 'admin'} style={{ borderColor: '#fbcfe8' }}>
                      <option value="PB">Pribbenow (PB)</option>
                      <option value="ED">El Descanso (ED)</option>
                      <option value="Ambas">Ambas Minas (PB/ED)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Cambiar Grupo</label>
                    <select className="input-field" value={usuarioEditando.grupo || '1'} onChange={e => setUsuarioEditando({ ...usuarioEditando, grupo: e.target.value })} style={{ borderColor: '#fbcfe8' }}>
                      <option value="1">Grupo 1</option>
                      <option value="2">Grupo 2</option>
                      <option value="3">Grupo 3</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#701a75' }}>Estado Corporativo</label>
                    <select className="input-field" value={usuarioEditando.estado} onChange={e => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })} style={{ borderColor: '#fbcfe8', background: usuarioEditando.estado === 'Activo' ? '#f0fdf4' : '#fef2f2' }}>
                      <option value="Activo">🟢 Activo</option>
                      <option value="Inactivo">🔴 Inactivo / Suspendido</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" style={{ background: '#c026d3', borderColor: '#c026d3' }} onClick={async () => {
                    if (!usuarioEditando.username || !usuarioEditando.nombre) return addToast('No puedes dejar campos principales vacíos.', 'error');
                    if (usuarioEditando.role === 'admin') usuarioEditando.mina = 'Ambas';

                    const { error } = await supabase.from('usuarios').update(usuarioEditando).eq('id', usuarioEditando.id);
                    if (error) return addToast('Error al actualizar: ' + error.message, 'error');

                    setDbUsuarios(dbUsuarios.map(u => u.id === usuarioEditando.id ? usuarioEditando : u));
                    setUsuarioEditando(null);
                    addToast('✅ Modificaciones aplicadas en el directorio.');
                  }}>💾 Guardar Cambios</button>
                </div>
              </div>
            )}

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>Estado</th>
                    <th>Rol en el Sistema</th>
                    <th>Ubicación Fija</th>
                    <th>Grupo</th>
                    <th>Otorgamiento</th>
                    <th style={{ textAlign: 'right' }}>Controles</th>
                  </tr>
                </thead>
                <tbody>
                  {dbUsuarios.map(u => (
                    <tr key={u.id}>
                      <td data-label="Nombre Completo">
                        <strong style={{ color: 'var(--primary-black)', fontSize: '1rem' }}>{u.nombre}</strong><br />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{u.username}</span>
                      </td>
                      <td data-label="Estado">
                        {u.estado === 'Activo' ? (
                          <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> Activo
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> Inactivo
                          </span>
                        )}
                      </td>
                      <td data-label="Rol">
                        <span className="badge" style={{ background: u.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: u.role === 'admin' ? '#991b1b' : '#3730a3' }}>
                          {u.role}
                        </span>
                      </td>
                      <td data-label="Ubicación" style={{ fontWeight: '500' }}>{u.role === 'admin' ? 'Todo' : `Mina ${u.mina}`}</td>
                      <td data-label="Grupo">
                        <span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.8rem' }}>
                          G{u.grupo || '1'}
                        </span>
                      </td>
                      <td data-label="Alta" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.creado}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button title="Editar Parametros" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center' }} onClick={() => {
                            setUsuarioEditando(u);
                            setIsCreandoUsuario(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}>
                            <Edit3 size={15} />
                          </button>
                          <button title="Resetear Clave" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center' }} onClick={() => {
                            showConfirm({
                              type: 'confirm',
                              title: '🔐 Reseteo de Credenciales',
                              message: `¿Forzar a ${u.nombre} a actualizar su contraseña? Se le pedirá cambio obligatorio cuando intente loguearse nuevamente.`,
                              onConfirm: async () => {
                                const { error } = await supabase.from('usuarios').update({ password: 'con123', firstTime: true }).eq('id', u.id);
                                if (error) return addToast('Error al resetear clave: ' + error.message, 'error');
                                setDbUsuarios(dbUsuarios.map(x => x.id === u.id ? { ...x, password: 'con123', firstTime: true } : x));
                                addToast(`Se ha suspendido temporalmente por reseteo a ${u.nombre}. Usará clave estándar "con123".`);
                              }
                            });
                          }}>
                            <RefreshCcw size={15} />
                          </button>
                          <button title="Eliminar del Sistema" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center' }} onClick={() => {
                            if (u.username === 'admin' || u.username === 'aramirez') {
                              return addToast('No se puede despedir al Administrador Supremo del sistema.', 'error');
                            }
                            showConfirm({
                              type: 'confirm',
                              title: '🗑️ Baja de Colaborador',
                              message: `¿Remover a ${u.username} del ecosistema corporativo absolutamente?`,
                              onConfirm: async () => {
                                const { error } = await supabase.from('usuarios').delete().eq('id', u.id);
                                if (error) return addToast('Error al eliminar: ' + error.message, 'error');
                                setDbUsuarios(dbUsuarios.filter(x => x.id !== u.id));
                                addToast('Usuario removido del sistema con éxito.');
                              }
                            });
                          }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Report View */}
        {activeTab === 'nuevo' && (
          <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-black)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PlusCircle size={22} strokeWidth={2} style={{ color: 'var(--primary-red)' }} /> Nuevo Reporte
            </h2>

            <div className="form-section-divider"><span className="form-section-title">Datos del Camión</span></div>
            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Identificación del Camión</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ borderColor: flota.length > 0 && !isFlotaValid ? 'var(--primary-red)' : '' }}
                  placeholder="Ej: 2554 (Inicia con 2)"
                  value={flota}
                  onChange={(e) => setFlota(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                {flota.length > 0 && !isFlotaValid && (
                  <span style={{ color: 'var(--primary-red)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    Debe tener 4 dígitos y comenzar por 2.
                  </span>
                )}
              </div>
            </div>

            <div className="form-section-divider"><span className="form-section-title">Operador Asignado</span></div>
            <div className="form-grid-2" style={{ alignItems: 'flex-end', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Nombre del Operador</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nombre del operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%' }}>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ubicación (Mina)</label>
                  <select
                    className="input-field"
                    style={{ 
                      padding: '0.4rem 0.6rem', 
                      fontSize: '0.85rem',
                      backgroundColor: session.role !== 'admin' ? '#f3f4f6' : 'rgba(255,255,255,0.8)',
                      cursor: session.role !== 'admin' ? 'not-allowed' : 'default'
                    }}
                    value={mina}
                    onChange={(e) => setMina(e.target.value)}
                    disabled={session.role !== 'admin'}
                  >
                    <option value="PB">PB</option>
                    <option value="ED">ED</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grupo</label>
                  <select
                    className="input-field"
                    style={{ 
                      padding: '0.4rem 0.6rem', 
                      fontSize: '0.85rem',
                      backgroundColor: session.role !== 'admin' ? '#f3f4f6' : 'rgba(255,255,255,0.8)',
                      cursor: session.role !== 'admin' ? 'not-allowed' : 'default'
                    }}
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    disabled={session.role !== 'admin'}
                  >
                    <option value="1">G1</option>
                    <option value="2">G2</option>
                    <option value="3">G3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section-divider"><span className="form-section-title">Checklist de Fallas</span></div>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Fallas Mecánicas (Falta de Confort)</h3>
                <div style={{
                  backgroundColor: totalImpacto > 50 ? 'var(--primary-red)' : totalImpacto > 20 ? 'var(--secondary-yellow)' : totalImpacto > 0 ? '#10b981' : '#e5e7eb',
                  color: totalImpacto > 20 && totalImpacto <= 50 ? 'var(--primary-black)' : totalImpacto === 0 ? 'var(--primary-black)' : 'white',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}>
                  Atención Requerida: {totalImpacto > 50 ? '🚨 CRÍTICA' : totalImpacto > 20 ? '⚠️ ALTA' : totalImpacto > 0 ? '✅ NORMAL' : 'Sin Datos'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {fallas.map(falla => (
                  <div key={falla.id} style={{ background: 'white', padding: '0.8rem 1.5rem', borderRadius: '50px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem', transition: 'all 0.3s', boxShadow: selectedDanos[falla.id] ? '0 4px 12px rgba(239, 68, 68, 0.1)' : 'none', borderColor: selectedDanos[falla.id] ? 'var(--primary-red)' : 'var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '500', width: '100%' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input
                            type="checkbox"
                            checked={!!selectedDanos[falla.id]}
                            onChange={() => handleDanoToggle(falla.id)}
                            style={{
                              width: '24px',
                              height: '24px',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              borderRadius: '50%',
                              border: `2px solid ${selectedDanos[falla.id] ? 'var(--primary-red)' : '#d1d5db'}`,
                              backgroundColor: selectedDanos[falla.id] ? 'var(--primary-red)' : 'white',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          />
                          {selectedDanos[falla.id] && (
                            <div style={{
                              position: 'absolute',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              pointerEvents: 'none'
                            }} />
                          )}
                        </div>
                        {falla.nombre}
                      </label>
                      <span className="badge" style={{
                        background: falla.impacto >= 25 ? 'rgba(227, 25, 55, 0.1)' : falla.impacto >= 10 ? 'rgba(255, 242, 0, 0.2)' : '#e5e7eb',
                        color: falla.impacto >= 25 ? 'var(--primary-red)' : falla.impacto >= 10 ? '#854d0e' : '#4b5563',
                        padding: '0.4rem 0.8rem',
                        border: `1px solid ${falla.impacto >= 25 ? 'rgba(227, 25, 55, 0.2)' : falla.impacto >= 10 ? 'rgba(255, 242, 0, 0.5)' : '#d1d5db'}`
                      }}>
                        {falla.impacto >= 25 ? 'Crítico' : falla.impacto >= 10 ? 'Mayor' : 'Menor'}
                      </span>
                    </div>

                    {selectedDanos[falla.id] && (
                      <div className="fade-in" style={{ paddingLeft: '2.5rem' }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder={`Detalle u observación sobre: ${falla.nombre}...`}
                          value={observaciones[falla.id] || ''}
                          onChange={(e) => handleObsChange(falla.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!isFlotaValid || !operador || totalImpacto === 0}
                onClick={async () => {
                  const camionExistente = camionesRegistrados.find(c => c.flota === flota && c.estado !== 'liberado');

                  if (camionExistente) {
                    // Normalización de Nombres v3.0
                    const opLimpio = normalizarNombre(operador);
                    const supLimpio = normalizarNombre(session.nombre);

                    // 1. Integración de Grupos, Conductores y Supervisores
                    const listaGrupos = Array.from(new Set([...camionExistente.grupo.split(/\s*[,|]\s*/), grupo])).sort();

                    const nuevoRegSup = `G${grupo}: ${supLimpio}`;
                    const supsActuales = (camionExistente.supervisor || '').split(/\s*[,|]\s*/).filter(Boolean);
                    const listaSupervisores = Array.from(new Set([...supsActuales, nuevoRegSup]));

                    const nuevoRegOp = `G${grupo}: ${opLimpio}`;
                    const opsActuales = (camionExistente.operador || '').split(/\s*[,|]\s*/).filter(Boolean);
                    const listaOperadores = Array.from(new Set([...opsActuales, nuevoRegOp]));

                    const numGrupos = listaGrupos.length;

                    // 2. Integración de Fallas y Puntos Base
                    // Identificamos IDs de fallas nuevas y existentes para desduplicar puntos
                    const fallasActualesIds = new Set();
                    fallas.forEach(f => {
                      if (camionExistente.fallas.includes(f.nombre)) fallasActualesIds.add(f.id);
                    });

                    const todasFallasIds = new Set([...Array.from(fallasActualesIds), ...Object.keys(selectedDanos)]);

                    const puntosBase = Array.from(todasFallasIds).reduce((acc, id) => {
                      const f = fallas.find(x => x.id === id);
                      return acc + (f ? f.impacto : 0);
                    }, 0);

                    // 3. Algoritmo de Prioridad Escalable (Bono Consenso)
                    const bonoConsenso = (numGrupos - 1) * 30;
                    const puntosFinales = puntosBase + bonoConsenso;
                    const atencionLabel = puntosFinales > 50 ? 'CRÍTICA' : puntosFinales > 20 ? 'ALTA' : 'NORMAL';

                    // 4. Construcción del string de fallas consolidado (Preservando comentarios anteriores)
                    const obsAnteriores = {};
                    if (camionExistente.fallas) {
                      const rawFallas = camionExistente.fallas;
                      const parts = [];
                      let depth = 0;
                      let lastSplit = 0;

                      for (let i = 0; i < rawFallas.length; i++) {
                        const char = rawFallas[i];
                        if (char === '(') depth++;
                        if (char === ')') depth--;
                        if (depth === 0 && char === ',') {
                          parts.push(rawFallas.substring(lastSplit, i).trim());
                          lastSplit = i + 1;
                        }
                      }
                      parts.push(rawFallas.substring(lastSplit).trim());

                      parts.forEach(p => {
                        if (!p || p === '-') return;
                        const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                        if (match && match[2]) {
                          const fObj = fallas.find(f => f.nombre === match[1].trim());
                          if (fObj) obsAnteriores[fObj.id] = match[2];
                        }
                      });
                    }

                    const fallasConsolidadas = Array.from(todasFallasIds).map(id => {
                      const f = fallas.find(x => x.id === id);
                      const obsViejas = obsAnteriores[id] || '';
                      const obsNuevas = observaciones[id] ? `G${grupo}: ${observaciones[id]}` : '';

                      // Motor de Inteligencia Algorítmica (Detección Semántica / Lógica Difusa)
                      const todasObs = [obsViejas, obsNuevas].filter(Boolean).sort((a, b) => b.length - a.length);
                      const unicas = [];
                      todasObs.forEach(curr => {
                        // Si la similitud con una observación ya aceptada es > 65%, descartar por redundante
                        const esSimil = unicas.some(larga => {
                          const sim = calcularSimilitudIA(larga, curr);
                          const esSub = larga.toLowerCase().includes(curr.toLowerCase());
                          return sim > 0.65 || esSub;
                        });
                        if (!esSimil) unicas.push(curr);
                      });

                      const combined = unicas.join(' | ');

                      return f.nombre + (combined ? ` (${combined})` : '');
                    }).join(' | ');

                    // Construimos la estructura JSON del grupo que reporta
                    const fallasStruct = {};
                    Object.keys(selectedDanos).forEach(id => {
                        // IA: Corrección de Ortografía Automática v3.5
                        fallasStruct[id] = corregirOrtografiaIA(observaciones[id] || '');
                    });
                    const detallesAnteriores = camionExistente.detalles_grupos || {};
                    const detallesNuevos = {
                       ...detallesAnteriores,
                       [`G${grupo}`]: {
                          supervisor: normalizarNombre(session.nombre),
                          operador: normalizarNombre(operador),
                          mina: mina,
                          time: new Date().toLocaleString(),
                          fallas: fallasStruct
                       }
                    };

                    const camionActualizado = {
                      ...camionExistente,
                      grupo: listaGrupos.join(' | '),
                      supervisor: listaSupervisores.join(' | '),
                      operador: listaOperadores.join(' | '),
                      fallas: fallasConsolidadas,
                      puntos: puntosFinales,
                      atencion: atencionLabel,
                      consenso: numGrupos, // Nuevo campo para UI
                      detalles_grupos: detallesNuevos
                    };

                    const { error } = await supabase.from('camiones').update(camionActualizado).eq('id', camionExistente.id);
                    if (error) return addToast('Error al integrar reporte: ' + error.message, "error");

                    setCamionesRegistrados(prev => prev.map(c => c.id === camionExistente.id ? camionActualizado : c));
                    addToast(`✅ Reporte integrado con éxito para el camión ${flota}.`);

                  } else {
                    // Lógica de Inserción Normal (Primer reporte)
                    const atencionLabel = totalImpacto > 50 ? 'CRÍTICA' : totalImpacto > 20 ? 'ALTA' : 'NORMAL';

                    const fallasDetalladas = Object.keys(selectedDanos).map(id => {
                      const nombreFalla = fallas.find(f => f.id === id)?.nombre;
                      // IA: Corrección de Ortografía Automática v3.5
                      const comentarioLimpio = corregirOrtografiaIA(observaciones[id] || '');
                      const comentario = comentarioLimpio ? ` (G${grupo}: ${comentarioLimpio})` : '';
                      return `${nombreFalla}${comentario}`;
                    }).join(' | ');

                    const fallasStruct = {};
                    Object.keys(selectedDanos).forEach(id => {
                        fallasStruct[id] = corregirOrtografiaIA(observaciones[id] || '');
                    });
                    const detallesNuevos = {
                       [`G${grupo}`]: {
                          supervisor: normalizarNombre(session.nombre),
                          operador: normalizarNombre(operador),
                          mina: mina,
                          time: new Date().toLocaleString(),
                          fallas: fallasStruct
                       }
                    };

                    const nuevoCamion = {
                      flota: flota,
                      operador: `G${grupo}: ${normalizarNombre(operador)}`,
                      mina: mina,
                      grupo: grupo,
                      supervisor: `G${grupo}: ${normalizarNombre(session.nombre)}`,
                      estado: 'espera',
                      atencion: atencionLabel,
                      fallas: fallasDetalladas,
                      time: new Date().toLocaleString(),
                      puntos: totalImpacto,
                      consenso: 1,
                      detalles_grupos: detallesNuevos
                    };

                    const { data, error } = await supabase.from('camiones').insert([nuevoCamion]).select();
                    if (error) return addToast('Error al registrar camión: ' + error.message, "error");

                    setCamionesRegistrados([data[0], ...camionesRegistrados]);
                    addToast('✅ Camión ' + flota + ' enviado a la Lista de Espera con éxito.');
                  }

                  setActiveTab('dashboard');
                  setFlota(''); setOperador(''); setSelectedDanos({}); setObservaciones({});
                }}
                style={{ opacity: (!isFlotaValid || !operador || totalImpacto === 0) ? 0.5 : 1 }}
              >
                📥 Enviar a Lista de Espera
              </button>
            </div>
          </div>
        )}


        {/* Modal de Motivo de Garantía Estilo Glassmorphism */}
        {camionInGarantia && (
          <div
            className="fade-in"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '2rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '550px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldAlert size={28} />
                </div>
                <h2 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.5rem' }}>Anotar Pendientes</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Camión {camionInGarantia.flota}: Selecciona las fallas originales que persisten.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
                {fallas.filter(f => (camionInGarantia?.fallas || '').includes(f.nombre)).map(f => {
                  const isSelected = !!pendientesGarantia[f.id]?.selected;
                  return (
                    <div key={f.id} style={{ 
                      background: 'white', 
                      padding: '0.8rem 1.5rem', 
                      borderRadius: '50px', 
                      border: '1px solid var(--border-color)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.8rem', 
                      transition: 'all 0.3s', 
                      boxShadow: isSelected ? '0 4px 12px rgba(239, 68, 68, 0.1)' : 'none', 
                      borderColor: isSelected ? 'var(--primary-red)' : 'var(--border-color)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: '500', width: '100%' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setPendientesGarantia(prev => ({
                                ...prev,
                                [f.id]: { ...prev[f.id], selected: !prev[f.id]?.selected }
                              }))}
                              style={{
                                width: '24px',
                                height: '24px',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                borderRadius: '50%',
                                border: `2px solid ${isSelected ? 'var(--primary-red)' : '#d1d5db'}`,
                                backgroundColor: isSelected ? 'var(--primary-red)' : 'white',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                pointerEvents: 'none'
                              }} />
                            )}
                          </div>
                          {f.nombre}
                        </label>
                        <span className="badge" style={{
                          background: f.impacto >= 25 ? 'rgba(227, 25, 55, 0.1)' : f.impacto >= 10 ? 'rgba(255, 242, 0, 0.2)' : '#e5e7eb',
                          color: f.impacto >= 25 ? 'var(--primary-red)' : f.impacto >= 10 ? '#854d0e' : '#4b5563',
                          padding: '0.4rem 0.8rem',
                          border: `1px solid ${f.impacto >= 25 ? 'rgba(227, 25, 55, 0.2)' : f.impacto >= 10 ? 'rgba(255, 242, 0, 0.5)' : '#d1d5db'}`
                        }}>
                          {f.impacto >= 25 ? 'Crítico' : f.impacto >= 10 ? 'Mayor' : 'Menor'}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="fade-in" style={{ paddingLeft: '2.5rem' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Explica qué sigue fallando..."
                            value={pendientesGarantia[f.id]?.comment || ''}
                            onChange={(e) => setPendientesGarantia(prev => ({
                              ...prev,
                              [f.id]: { ...prev[f.id], comment: e.target.value }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCamionInGarantia(null)}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: 'none' }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmarGarantia}
                  style={{ flex: 2, background: 'var(--primary-red)', border: 'none', boxShadow: '0 4px 12px rgba(227, 25, 55, 0.2)' }}
                >
                  Confirmar Garantía
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles Técnicos (Global) */}
        {selectedReport && (
          <div
            className="fade-in"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="card"
              style={{
                maxWidth: '500px',
                width: '100%',
                margin: 0,
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '10px', color: '#ef4444' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--primary-black)' }}>Ficha Técnica - {selectedReport.flota}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mina {selectedReport.mina} - Grupo {formatGrupo(selectedReport.grupo)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción de Fallas y Comentarios:</label>
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {limpiarFallasIA(selectedReport.fallas).map(f => `${f.falla}${f.obs !== '-' ? ` (${f.obs})` : ''}`).join(' | ')}
                </div>
              </div>

              {selectedReport.dictamen_tecnico && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔧 Dictamen Técnico de Mantenimiento:</label>
                  <div style={{ background: '#f5f3ff', padding: '1.2rem', borderRadius: '8px', border: '1px solid #ddd6fe', color: '#4c1d95', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: '500' }}>
                    {selectedReport.dictamen_tecnico}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#0369a1', fontWeight: 'bold' }}>REPORTE POR (SUPERVISOR):</span>
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e', fontWeight: 'bold' }}>{(selectedReport.supervisor || 'N/A').split(/\s*[,|]\s*/).join(' | ')}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>OPERADOR PERMANENTE:</span>
                  <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{(selectedReport.operador || 'No asignado').split(/\s*[,|]\s*/).join(' | ')}</span>
                </div>
              </div>

              {/* Sección de Pendientes de Garantía si existen */}
              {selectedReport.motivo_garantia && (
                <div style={{ marginBottom: '1.5rem', background: '#fff5f5', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldAlert size={14} /> Fallas Pendientes de Garantía:
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#991b1b', lineHeight: '1.5' }}>
                    {selectedReport.motivo_garantia.split(' | ').map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#ef4444' }}>•</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: '#fdf2f8', padding: '0.8rem', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#be185d', fontWeight: 'bold', marginRight: '0.5rem' }}>FECHA DE REGISTRO:</span>
                <span style={{ fontSize: '0.85rem', color: '#831843' }}>{formatFechaCorta(selectedReport.time)}</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSelectedReport(null)}
              >
                Cerrar Ficha Técnica
              </button>
            </div>
          </div>
        )}

        {/* Modal de Edición Rápida Avanzada de Camión (Admin/Supervisor) */}
        {camionEditando && (
          <div
            key={camionEditando.id} 
            className="fade-in"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '650px',
                width: '100%',
                padding: '2.5rem',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(25px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(227, 25, 55, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
                    <Truck size={24} color="var(--primary-red)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.3rem' }}>
                      {editingGroupContext === 'Mantenimiento' ? 'Dictamen Técnico' : 'Edición del Diagnóstico'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {editingGroupContext === 'Mantenimiento' 
                        ? `Registrando hallazgos para el equipo ${camionEditando?.flota}`
                        : `Corrija fallas y operador para el equipo ${camionEditando?.flota}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setCamionEditando(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.8rem' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Campos Principales (Ocultos en Dictamen) */}
                {editingGroupContext !== 'Mantenimiento' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                    <div>
                      <label className="input-label">N° Flota</label>
                      <input type="text" className="input-field" value={camionEditando?.flota || ''} disabled style={{ background: '#f8fafc', fontWeight: 'bold' }} />
                    </div>
                    <div>
                      <label className="input-label">
                        {editingGroupContext === 'General' ? 'Nombres de Operadores (Completo)' : `Nombre del Operador`}
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={operadorEdit}
                        onChange={e => setOperadorEdit(e.target.value)}
                        placeholder={editingGroupContext === 'General' ? "Nombres de todos los conductores..." : "Nombre del conductor para este grupo..."}
                        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  </div>
                )}

                {/* Selector de Grupo Estilo Tabs (v4.0) - Oculto en Dictamen */}
                {editingGroupContext !== 'Mantenimiento' && (session.role === 'admin' || session.role === 'supervisor') && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    {['General', 'G1', 'G2', 'G3', 'Mantenimiento'].map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          setEditingGroupContext(g);
                          sincronizarModal(camionEditando, g);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: editingGroupContext === g ? (g === 'Mantenimiento' ? '#7c3aed' : 'var(--primary-red)') : 'transparent',
                          color: editingGroupContext === g ? 'white' : '#64748b',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'block'
                        }}
                      >
                        {g === 'General' ? 'General (Unificado)' : g === 'Mantenimiento' ? 'Dictamen Técnico' : `Reporte ${g}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Vista Específica de Dictamen Técnico */}
                {editingGroupContext === 'Mantenimiento' && (
                  <div className="fade-in" style={{ marginTop: '1rem', background: '#f5f3ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                    <label className="input-label" style={{ color: '#7c3aed', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={20} /> Hallazgos Técnicos de Mantenimiento
                    </label>
                    <textarea
                      className="input-field"
                      style={{ 
                        width: '100%', 
                        minHeight: '150px', 
                        padding: '1rem', 
                        fontSize: '0.9rem', 
                        borderRadius: '8px',
                        border: '1px solid #c4b5fd',
                        background: 'white'
                      }}
                      placeholder="Escriba aquí el dictamen técnico final, causas encontradas y reparaciones sugeridas..."
                      value={dictamenEdit}
                      onChange={(e) => setDictamenEdit(e.target.value)}
                    />
                    <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#6d28d9', fontStyle: 'italic' }}>
                      * Este diagnóstico será visible para todos los grupos en la Ficha Técnica.
                    </p>
                  </div>
                )}

                {/* Checklist de Fallas Estilo Premium (Solo si no es Dictamen) */}
                {editingGroupContext !== 'Mantenimiento' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                      {editingGroupContext === 'General' ? 'Reporte de Fallas General' : `Fallas Reportadas`}
                    </label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}>
                      {fallas.map(falla => (
                        <div
                          key={falla.id}
                          style={{
                            background: selectedDanosEdit[falla.id] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            border: selectedDanosEdit[falla.id] ? '1px solid var(--primary-red)' : '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            boxShadow: selectedDanosEdit[falla.id] ? '0 4px 12px rgba(227, 25, 55, 0.05)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!selectedDanosEdit[falla.id]}
                                onChange={() => handleDanoToggleEdit(falla.id)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  borderRadius: '50%',
                                  border: `2px solid ${selectedDanosEdit[falla.id] ? 'var(--primary-red)' : '#d1d5db'}`,
                                  backgroundColor: selectedDanosEdit[falla.id] ? 'var(--primary-red)' : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              />
                              {selectedDanosEdit[falla.id] && (
                                <div style={{
                                  position: 'absolute',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  pointerEvents: 'none'
                                }} />
                              )}
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: selectedDanosEdit[falla.id] ? '600' : '400', flex: 1, color: 'var(--primary-black)' }}>
                              {falla.nombre}
                            </span>
                          </div>
                          {selectedDanosEdit[falla.id] && (
                            <div className="fade-in" style={{ marginTop: '0.8rem', paddingLeft: '2.2rem' }}>
                              <input
                                type="text"
                                className="input-field"
                                style={{
                                  padding: '0.6rem 0.8rem',
                                  fontSize: '0.85rem',
                                  background: 'white',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0'
                                }}
                                placeholder={`Observación detallada de la falla...`}
                                value={observacionesEdit[falla.id] || ''}
                                onChange={(e) => handleObsChangeEdit(falla.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer del Modal */}
                <div style={{
                  display: 'flex',
                  gap: '1.2rem',
                  marginTop: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <button className="btn btn-secondary" style={{ flex: 1, height: '48px' }} onClick={() => setCamionEditando(null)}>Descartar Cambios</button>
                  <button
                    className="btn btn-primary"
                    onClick={guardarEdicionAvanzada}
                    style={{ 
                      flex: 2, 
                      height: '48px',
                      justifyContent: 'center',
                      background: editingGroupContext === 'Mantenimiento' ? '#7c3aed' : 'var(--primary-red)',
                      borderColor: editingGroupContext === 'Mantenimiento' ? '#7c3aed' : 'var(--primary-red)',
                      boxShadow: '0 10px 15px -3px rgba(227, 25, 55, 0.3)'
                    }}
                    onClick={guardarEdicionAvanzada}
                  >
                    Actualizar Ficha Técnica
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Detalles de Garantía (Pendientes) */}
        {selectedGarantiaDetails && (
          <div
            className="fade-in"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(15px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedGarantiaDetails(null)}
          >
            <div
              className="card"
              style={{
                maxWidth: '450px',
                width: '100%',
                background: 'white',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldAlert size={32} />
                </div>
                <h3 style={{ margin: 0, color: 'var(--primary-black)', fontSize: '1.5rem' }}>Fallas Pendientes</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Equipo {selectedGarantiaDetails.flota}: Hallazgos de Garantía</p>
              </div>

              <div style={{ 
                background: '#fff5f5', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: '1px solid #fee2e2',
                color: '#991b1b',
                lineHeight: '1.6',
                fontSize: '1rem',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {(selectedGarantiaDetails.motivo_garantia || '').split(' | ').map((item, idx) => (
                  <div key={idx} style={{ marginBottom: idx === (selectedGarantiaDetails.motivo_garantia || '').split(' | ').length - 1 ? 0 : '0.8rem', display: 'flex', gap: '0.6rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1.5rem', height: '50px', background: '#ef4444', border: 'none', justifyContent: 'center' }}
                onClick={() => setSelectedGarantiaDetails(null)}
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ---------- SISTEMA DE MENSAJERÍA PERSONALIZADA (UI) ---------- */}

      {/* Container de Toasts (Superior Central) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 11000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        width: 'min(90%, 400px)'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast-animation" style={{
            background: toast.type === 'error' ? 'rgba(185, 28, 28, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Modal Personalizado (Alert / Confirm / Prompt) */}
      {modalConfig.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="modal-pop" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            width: 'min(100%, 500px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-black)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {modalConfig.type === 'prompt' ? <ShieldAlert size={28} color="#ef4444" /> :
                modalConfig.type === 'confirm' ? <AlertCircle size={28} color="#f59e0b" /> :
                  <Info size={28} color="#2563eb" />}
              {modalConfig.title}
            </h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1.05rem', margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
              {modalConfig.message}
            </p>

            {modalConfig.showInput && (
              <div style={{ marginBottom: '2rem' }}>
                <input
                  autoFocus
                  type="text"
                  className="input-field"
                  placeholder={modalConfig.inputPlaceholder}
                  value={modalConfig.inputValue}
                  onChange={(e) => setModalConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleModalConfirm()}
                  style={{
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    letterSpacing: '2px',
                    fontWeight: 'bold',
                    padding: '1rem',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {(modalConfig.type === 'confirm' || modalConfig.type === 'prompt') && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{
                  backgroundColor: modalConfig.type === 'prompt' ? '#ef4444' : 'var(--primary-red)'
                }}
                onClick={handleModalConfirm}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navegación Inferior (Solo Móvil) - Estilo Liquid Glass Ready */}
      <nav className="bottom-nav mobile-only">
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
        >
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'cola' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('cola'); }}
        >
          <Truck size={20} />
          <span>Lista</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'nuevo' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('nuevo'); }}
        >
          <PlusCircle size={20} />
          <span>Nuevo Reporte</span>
        </a>
        <a 
          href="#" 
          className={`bottom-nav-item ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('historial'); }}
        >
          <History size={20} />
          <span>Historial</span>
        </a>
        {session?.role === 'admin' && (
          <a 
            href="#" 
            className={`bottom-nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('usuarios'); }}
          >
            <Users size={20} />
            <span>Usuarios</span>
          </a>
        )}
      </nav>
      {/* Botón Volver Arriba Seguro v1.9.52 */}
      {showBackToTop && (
        <button 
          className="back-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

export default App;

