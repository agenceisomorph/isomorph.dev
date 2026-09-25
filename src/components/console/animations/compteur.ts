/**
 * Défilement d'une valeur affichée, de zéro à sa valeur réelle.
 *
 * La valeur de départ et la valeur d'arrivée sont lues dans le texte déjà
 * rendu : rien n'est inventé, le compteur ne fait que réécrire le texte
 * existant, puis le rend tel quel à la fin ou à l'arrêt.
 * Les séparateurs de milliers (espace, espace insécable, espace fine) et les
 * décimales sont conservés. La largeur finale est réservée pendant le
 * défilement : la ligne ne bouge pas.
 */

const MOTIF = /^(\D*?)(\d[\d \u00a0\u202f]*(?:[.,]\d+)?)([\s\S]*)$/;
const ESPACE = /[ \u00a0\u202f]/;

interface Lecture {
  avant: string;
  valeur: number;
  decimales: number;
  separateur: string;
  virgule: string;
  apres: string;
}

function lire(texte: string): Lecture | null {
  const m = texte.match(MOTIF);
  if (!m) return null;
  const [, avant, nombre, apres] = m;
  const separateur = nombre.match(ESPACE)?.[0] ?? "";
  const brut = nombre.replace(/[ \u00a0\u202f]/g, "");
  const virgule = brut.match(/[.,]/)?.[0] ?? ",";
  const decimales = brut.includes(virgule) ? brut.split(virgule)[1].length : 0;
  const valeur = Number(brut.replace(",", "."));
  if (!Number.isFinite(valeur)) return null;
  return { avant, valeur, decimales, separateur, virgule, apres };
}

function ecrire(l: Lecture, v: number): string {
  const [entier, fraction] = v.toFixed(l.decimales).split(".");
  const groupe = l.separateur ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, l.separateur) : entier;
  return l.avant + groupe + (fraction ? l.virgule + fraction : "") + l.apres;
}

/** Courbe de décélération (cubique) : vif au départ, posé à l'arrivée. */
const decelere = (t: number) => 1 - (1 - t) ** 3;

export interface Compteur {
  fini: Promise<void>;
  /** Arrête et rend le texte d'origine. */
  arreter: () => void;
}

export function lancerCompteur(cible: HTMLElement, delai: number, duree: number): Compteur {
  const noeud = cible.firstChild;
  const origine = cible.textContent ?? "";
  const lecture = lire(origine);
  if (!lecture || !(noeud instanceof Text)) return { fini: Promise.resolve(), arreter: () => {} };

  const largeur = cible.getBoundingClientRect().width;
  cible.style.minWidth = `${largeur}px`;
  cible.style.textAlign = "right";
  noeud.nodeValue = ecrire(lecture, 0);

  let image = 0;
  let minuteur = 0;
  let terminer: () => void = () => {};
  const fini = new Promise<void>((resoudre) => {
    terminer = resoudre;
  });

  const rendre = () => {
    window.clearTimeout(minuteur);
    window.cancelAnimationFrame(image);
    noeud.nodeValue = origine;
    cible.style.minWidth = "";
    cible.style.textAlign = "";
    terminer();
  };

  minuteur = window.setTimeout(() => {
    const debut = performance.now();
    const pas = (maintenant: number) => {
      const t = Math.min(1, Math.max(0, (maintenant - debut) / duree));
      noeud.nodeValue = ecrire(lecture, lecture.valeur * decelere(t));
      if (t < 1) image = window.requestAnimationFrame(pas);
      else rendre();
    };
    image = window.requestAnimationFrame(pas);
  }, delai);

  return { fini, arreter: rendre };
}
