"use client";

/**
 * Carte Console : fond MapLibre (tuiles OpenFreeMap) et surcouche d'interface.
 *
 * « use client » justifié : la carte est un canevas WebGL piloté en
 * JavaScript, chargé à l'approche de l'écran (IntersectionObserver), et la
 * surcouche suit ses déplacements (coordonnées du centre en direct).
 *
 * Rendu serveur identique au premier rendu navigateur : cadre, bandeau et
 * coordonnées du centre se calculent depuis les props seules, et l'état
 * d'attente est celui du serveur. La surcouche attend la taille du bloc
 * (ResizeObserver), le fond attend l'approche.
 *
 * Attente puis apparition (`apparition.ts`, `StylesCarte.tsx`) :
 *  - tant que la carte n'est pas prête à être vue, le cadre montre une mire
 *    pâle, un balayage lent et quatre crochets qui cherchent ;
 *  - prête à être vue = premier événement `idle` de MapLibre (style chargé,
 *    tuiles demandées reçues et peintes), jamais le seul chargement du
 *    script ; plafond de 8 s après la création de la carte, au-delà duquel
 *    elle se dévoile quand même ;
 *  - apparition en 1,5 s, mise au point d'objectif : la carte arrive très
 *    floue, passe net trop tôt, repart un peu floue puis se cale net dans un
 *    bref éclat ; les quatre crochets se referment ensemble et suivent
 *    l'objectif ; surcouche et commandes s'allument une fois net ; l'état
 *    « prete » retire ensuite animations et filtre ;
 *  - échec (script ou WebGL) : la surcouche seule, et une mention courte.
 *
 * Sobriété et performance :
 *  - MapLibre (JS, CSS, fil de calcul) n'est chargé que lorsque le bloc
 *    approche de l'écran, une fois par page (`chargeur.ts`) ;
 *  - ni glyphes ni sprites : aucune couche de texte dans le style ;
 *  - densité de pixels plafonnée à 2, contexte WebGL « basse consommation »,
 *    tuiles expirées non redemandées ;
 *  - la surcouche se recalcule sans lire la mise en page (`geometrie.ts`).
 *
 * Défilement de la page jamais capturé : molette sans effet sur la carte,
 * et au doigt, un seul doigt fait défiler la page, deux déplacent la carte.
 * Glisser à la souris déplace la carte.
 *
 * RGAA :
 *  - `aria-busy` sur le groupe pendant l'attente ; annonce polie hors du
 *    groupe (une région occupée peut être tue) : « Chargement de la carte »
 *    si l'attente dure, puis « Carte prête », ou « Carte indisponible » ;
 *  - le canevas reste inerte (hors du parcours clavier) tant qu'il est caché ;
 *  - groupe nommé par `titre` ; le canevas est focalisable, les flèches le
 *    déplacent, plus et moins zooment (clavier natif de MapLibre, rotation
 *    coupée) ;
 *  - commandes de zoom : vrais boutons nommés, 44 px, le bord s'allume au
 *    focus comme au survol, sans anneau ;
 *  - repères nommés repris dans une liste lue par les lecteurs d'écran, la
 *    surcouche graphique étant décorative ;
 *  - mouvement réduit : zoom et recentrage sans animation, élan coupé par
 *    MapLibre, surcouche fixe, attente sans balayage, apparition en fondu.
 *
 * Attribution obligatoire (licence ODbL, TileJSON OpenFreeMap) : toujours
 * visible au pied du cadre.
 */

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { Map as CarteMapLibre } from "maplibre-gl";

import { StylesConsole } from "../fondations";
import { DELAI_ANNONCE, DUREE_ANNONCE, DUREE_APPARITION, PLAFOND_ATTENTE } from "./apparition";
import { chargerMapLibre } from "./chargeur";
import {
  cadrer,
  centreDe,
  choisirPas,
  decimalesPas,
  ecrireLatitude,
  ecrireLongitude,
  type PointGeo,
  type Taille,
  type Vue,
} from "./geometrie";
import { styleCarte } from "./style";
import { StylesCarte } from "./StylesCarte";
import { cibleCase, Surcouche } from "./Surcouche";
import type { RepereCarte, ZoneCarte } from "./types";

const ZOOM_MIN = 2;
const ZOOM_MAX = 15;
/** Marge du cadrage : laisse la place des règles et des commandes. */
const MARGE_CADRAGE = 72;
/** Distance à laquelle le chargement commence, avant que le bloc n'entre à l'écran. */
const APPROCHE = "600px 0px";

export interface CarteGeoProps {
  /** Nom du groupe et du canevas pour les lecteurs d'écran. */
  titre: string;
  /** Libellé court du bandeau, en capitales. */
  libelle?: string;
  /** Points à faire tenir dans le cadre à l'ouverture. Prioritaire sur `centre` et `zoom`. Tableau stable (constante de module). */
  cadrage?: readonly PointGeo[];
  centre?: PointGeo;
  zoom?: number;
  reperes?: readonly RepereCarte[];
  zones?: readonly ZoneCarte[];
  /** Hauteur du bloc (classes Tailwind). */
  className?: string;
}

type Etat = "attente" | "apparition" | "prete" | "indisponible";

type Annonce = "" | "Chargement de la carte" | "Carte prête" | "Carte indisponible";

/** Coins du viseur d'attente. */
const COINS = ["hg", "hd", "bd", "bg"] as const;

const AUCUN_REPERE: readonly RepereCarte[] = [];
const AUCUNE_ZONE: readonly ZoneCarte[] = [];

function mouvementReduit(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CarteGeo({
  titre,
  libelle = "Carte",
  cadrage,
  centre,
  zoom = 5,
  reperes = AUCUN_REPERE,
  zones = AUCUNE_ZONE,
  className = "h-[440px] md:h-[600px]",
}: CarteGeoProps) {
  const idMotif = `csCarteHachures${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const zoneRef = useRef<HTMLDivElement>(null);
  const fondRef = useRef<HTMLDivElement>(null);
  const carteRef = useRef<CarteMapLibre | null>(null);

  const [taille, setTaille] = useState<Taille | null>(null);
  const [vueCarte, setVueCarte] = useState<Vue | null>(null);
  const [proche, setProche] = useState(false);
  const [etat, setEtat] = useState<Etat>("attente");
  const [annonce, setAnnonce] = useState<Annonce>("");

  /* Centre connu dès le serveur : il ne dépend pas de la taille. */
  const centreDepart = useMemo<PointGeo>(() => {
    if (cadrage && cadrage.length > 0) return centreDe(cadrage);
    return centre ?? [0, 0];
  }, [cadrage, centre]);

  /* Vue d'ouverture : le zoom du cadrage dépend de la taille du bloc. */
  const vueDepart = useMemo<Vue | null>(() => {
    if (!taille) return null;
    if (cadrage && cadrage.length > 0) {
      return cadrer(cadrage, taille, { marge: MARGE_CADRAGE, zoomMin: ZOOM_MIN, zoomMax: ZOOM_MAX, zoomSeul: zoom });
    }
    return { lng: centreDepart[0], lat: centreDepart[1], zoom };
  }, [taille, cadrage, centreDepart, zoom]);

  const vueDepartRef = useRef<Vue | null>(null);
  useEffect(() => {
    vueDepartRef.current = vueDepart;
  }, [vueDepart]);

  const vue = vueCarte ?? vueDepart;

  /* Taille du bloc : lue dans le rappel de l'observateur, mise en page déjà faite. */
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const observateur = new ResizeObserver(() => {
      const largeur = zone.clientWidth;
      const hauteur = zone.clientHeight;
      setTaille((t) => (t && t.largeur === largeur && t.hauteur === hauteur ? t : { largeur, hauteur }));
    });
    observateur.observe(zone);
    return () => observateur.disconnect();
  }, []);

  /* Approche de l'écran : déclenche le chargement, une seule fois. */
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    if (typeof IntersectionObserver === "undefined") {
      setProche(true);
      return;
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setProche(true);
          observateur.disconnect();
        }
      },
      { rootMargin: APPROCHE },
    );
    observateur.observe(zone);
    return () => observateur.disconnect();
  }, []);

  /* Création de la carte, quand le bloc est proche et mesuré. */
  const creer = proche && taille !== null;
  useEffect(() => {
    if (!creer) return;
    const conteneur = fondRef.current;
    const depart = vueDepartRef.current;
    if (!conteneur || !depart) return;

    let annule = false;
    let revelee = false;
    let chargementAnnonce = false;
    let carte: CarteMapLibre | null = null;
    let plafond: ReturnType<typeof setTimeout> | undefined;

    /* Le chargement n'est annoncé que s'il dure : rien à dire d'une carte déjà là. */
    const annonceDiffere = setTimeout(() => {
      if (annule || revelee) return;
      chargementAnnonce = true;
      setAnnonce("Chargement de la carte");
    }, DELAI_ANNONCE);

    /* Dévoile la carte une seule fois : premier `idle`, ou plafond atteint. */
    const reveler = () => {
      if (annule || revelee) return;
      revelee = true;
      clearTimeout(annonceDiffere);
      clearTimeout(plafond);
      setEtat("apparition");
      if (chargementAnnonce) setAnnonce("Carte prête");
    };

    chargerMapLibre()
      .then((ml) => {
        if (annule) return;
        const instance = new ml.Map({
          container: conteneur,
          style: styleCarte(),
          center: [depart.lng, depart.lat],
          zoom: depart.zoom,
          minZoom: ZOOM_MIN,
          maxZoom: ZOOM_MAX,
          attributionControl: false,
          scrollZoom: false,
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          maxPitch: 0,
          renderWorldCopies: false,
          fadeDuration: 0,
          refreshExpiredTiles: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          canvasContextAttributes: { powerPreference: "low-power" },
          validateStyle: process.env.NODE_ENV !== "production",
          locale: {
            "Map.Title": `${titre}. Flèches pour déplacer, plus et moins pour zoomer.`,
            "CooperativeGesturesHandler.MobileHelpText": "Deux doigts pour déplacer la carte",
          },
        });
        instance.touchZoomRotate.disableRotation();
        instance.keyboard.disableRotation();
        const lire = () => {
          const c = instance.getCenter();
          setVueCarte({ lng: c.lng, lat: c.lat, zoom: instance.getZoom() });
        };
        instance.on("move", lire);
        instance.on("resize", lire);
        /* `idle` suit `load` : style chargé, tuiles demandées reçues et peintes. */
        instance.once("idle", reveler);
        plafond = setTimeout(reveler, PLAFOND_ATTENTE);
        carte = instance;
        carteRef.current = instance;
      })
      .catch(() => {
        /* WebGL 2 absent ou réseau coupé : la surcouche reste seule sur le fond. */
        if (annule) return;
        clearTimeout(annonceDiffere);
        setEtat("indisponible");
        setAnnonce("Carte indisponible");
      });

    return () => {
      annule = true;
      clearTimeout(annonceDiffere);
      clearTimeout(plafond);
      carte?.remove();
      carteRef.current = null;
    };
  }, [creer, titre]);

  /* Fin de l'apparition : plus d'animation ni de filtre sur le canevas. */
  useEffect(() => {
    if (etat !== "apparition") return;
    const minuterie = setTimeout(() => setEtat("prete"), DUREE_APPARITION);
    return () => clearTimeout(minuterie);
  }, [etat]);

  /* « Carte prête » s'efface ensuite, sans nouvelle annonce. */
  useEffect(() => {
    if (annonce !== "Carte prête") return;
    const minuterie = setTimeout(() => setAnnonce(""), DUREE_ANNONCE);
    return () => clearTimeout(minuterie);
  }, [annonce]);

  const zoomer = (sens: 1 | -1) => {
    const carte = carteRef.current;
    if (!carte) return;
    const options = { animate: !mouvementReduit() };
    if (sens === 1) carte.zoomIn(options);
    else carte.zoomOut(options);
  };

  const recentrer = () => {
    const carte = carteRef.current;
    const depart = vueDepartRef.current;
    if (!carte || !depart) return;
    carte.easeTo({ center: [depart.lng, depart.lat], zoom: depart.zoom, animate: !mouvementReduit() });
  };

  const [lngCentre, latCentre] = vue ? [vue.lng, vue.lat] : centreDepart;
  const maille = vue && taille ? choisirPas(vue.zoom, cibleCase(taille.largeur)) : null;
  const attente = etat === "attente";
  const inactif = attente || etat === "indisponible";
  const visible = etat === "apparition" || etat === "prete";
  const nommes = reperes.filter((r) => r.libelle);

  return (
    <>
      <div
        role="group"
        aria-label={titre}
        aria-busy={attente || undefined}
        className={`csCarte csPanneau csCoupe relative ${className}`}
        data-coupe="l"
        data-etat={etat}
      >
        <StylesConsole />
        <StylesCarte />

        <div className="csCarteCorps">
          {/* Bandeau : libellé à gauche, centre de la carte à droite (en dessous sur mobile). */}
          <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-(--cs-neon)/20 py-2 pr-5 pl-8">
            <p className="type-caption flex min-w-0 items-center gap-3 uppercase tracking-[0.22em] text-(--cs-neon)">
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
                <rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" />
                <rect x="4" y="4" width="4" height="4" fill="currentColor" />
              </svg>
              <span className="truncate">{libelle}</span>
            </p>
            <p className="type-caption flex shrink-0 gap-3 tabular-nums text-white">
              <span className="sr-only">Centre de la carte :</span>
              <span>{ecrireLatitude(latCentre, 4)}</span>
              <span>{ecrireLongitude(lngCentre, 4)}</span>
            </p>
          </div>

          {/* Carte et surcouche */}
          <div ref={zoneRef} className="type-caption relative min-h-0 flex-1 overflow-hidden">
            <div ref={fondRef} className="csCarteFond" inert={!visible} />
            {vue && taille ? <Surcouche vue={vue} taille={taille} reperes={reperes} zones={zones} idMotif={idMotif} /> : null}

            {/* Attente : mire, balayage et viseur, décoratifs ; retirés une fois la carte prête. */}
            {attente || etat === "apparition" ? (
              <>
                <div aria-hidden="true" className="csCarteAttente">
                  <span className="csCarteMire" />
                  <span className="csCarteCroix" />
                  <span className="csCarteBalayage" />
                </div>
                <div aria-hidden="true" className="csCarteViseur">
                  {COINS.map((coin) => (
                    <span key={coin} className="csCarteVise" data-coin={coin} />
                  ))}
                </div>
              </>
            ) : null}

            {etat === "indisponible" ? (
              <p
                aria-hidden="true"
                className="type-caption absolute bottom-3 left-9 uppercase tracking-[0.22em] text-(--cs-texte-3)"
              >
                Carte indisponible
              </p>
            ) : null}

            <div className="csCarteCommandes absolute right-3 bottom-3 flex flex-col gap-2">
              <Commande libelle="Zoomer" inactif={inactif} onClick={() => zoomer(1)}>
                <path d="M8 3v10M3 8h10" />
              </Commande>
              <Commande libelle="Dézoomer" inactif={inactif} onClick={() => zoomer(-1)}>
                <path d="M3 8h10" />
              </Commande>
              <Commande libelle="Recentrer la carte" inactif={inactif} onClick={recentrer}>
                <path d="M8 1v4M8 11v4M1 8h4M11 8h4" />
                <rect x="6.5" y="6.5" width="3" height="3" />
              </Commande>
            </div>
          </div>

          {/* Pied : attribution des données (ODbL) et maille de la grille. */}
          <div className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-(--cs-neon)/20 py-1.5 pr-8 pl-5">
            <p className="type-caption flex flex-wrap gap-x-3 text-(--cs-texte-3)">
              <a className="csCarteLien" href="https://openfreemap.org">
                OpenFreeMap
              </a>
              <a className="csCarteLien" href="https://www.openmaptiles.org/">
                © OpenMapTiles
              </a>
              <a className="csCarteLien" href="https://www.openstreetmap.org/copyright">
                © OpenStreetMap
              </a>
            </p>
            {maille !== null ? (
              <p className="type-caption uppercase tracking-[0.22em] text-(--cs-texte-3)">
                Maille {`${maille.toFixed(decimalesPas(maille)).replace(".", ",")}°`}
              </p>
            ) : null}
          </div>
        </div>

        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />
        <span aria-hidden="true" className="csEquerre" data-coin="hd" />
        <span aria-hidden="true" className="csEquerre" data-coin="bg" />

        {nommes.length > 0 ? (
          <ul className="sr-only" aria-label="Repères">
            {nommes.map((r) => (
              <li key={r.id}>{`${r.libelle} : ${ecrireLatitude(r.point[1], 4)}, ${ecrireLongitude(r.point[0], 4)}`}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {/* Hors du groupe : un lecteur d'écran peut taire une région occupée. */}
      <p role="status" className="sr-only">
        {annonce}
      </p>
    </>
  );
}

/** Commande de la carte : bouton de 44 px, verre et coins coupés. */
function Commande({
  libelle,
  inactif,
  onClick,
  children,
}: {
  libelle: string;
  inactif: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={libelle}
      disabled={inactif}
      onClick={onClick}
      className="csCarteCommande csCoupe"
      data-coupe="s"
    >
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        {children}
      </svg>
    </button>
  );
}
