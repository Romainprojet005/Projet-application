// Vérifie une réponse de Blind test en tolérant les fautes d'orthographe.
// « Voyaje voyaje », « bilie jean » ou « Désenchanté » sans accent sont acceptés.

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
}

// Nombre de lettres à ajouter, retirer ou remplacer pour passer de a à b
function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Fautes tolérées selon la longueur du mot ou du titre
function tolerance(len) {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  if (len <= 12) return 2;
  return 3;
}

// Le titre, et ses formes courtes : sans parenthèses, sans « feat. … », sans article au début
function titleVariants(title) {
  const base = title.replace(/\(.*?\)|\[.*?\]/g, ' ').split(/\s(?:feat\.?|ft\.?)\s/i)[0];
  const variants = new Set([normalize(title), normalize(base)]);
  for (const v of [...variants]) variants.add(v.replace(/^(le|la|les|l|the|un|une|des) /, ''));
  return [...variants].filter(Boolean);
}

export function isCorrectTitle(input, title) {
  const inp = normalize(input);
  if (inp.length < 2) return false;

  for (const tit of titleVariants(title)) {
    if (tit === inp) return true;
    // Une partie du titre suffit à partir de 4 lettres (« voyage » pour « Voyage Voyage »)
    if (inp.length >= 4 && tit.includes(inp)) return true;
    // Titre entier avec des fautes
    if (distance(inp, tit) <= tolerance(tit.length)) return true;
    // Une partie du titre avec des fautes : on compare aux mots du titre pris au même nombre.
    // Seulement à partir de 6 lettres, sinon « love » passerait pour « Lose Yourself »
    if (inp.length >= 6) {
      const words = tit.split(' ');
      const n = inp.split(' ').length;
      for (let i = 0; i + n <= words.length; i++) {
        const part = words.slice(i, i + n).join(' ');
        if (part.length >= 6 && distance(inp, part) <= tolerance(part.length)) return true;
      }
    }
  }
  return false;
}
