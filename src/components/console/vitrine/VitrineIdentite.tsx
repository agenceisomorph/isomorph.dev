/**
 * Vitrine « Identité » du système Console : texte en Saira, polices des
 * titres au choix en direct, palette proposée, curseurs de souris.
 */

import type { CSSProperties } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { ApercuCurseur } from "../identite/curseurs";
import type { FormeCurseur } from "../identite/curseurs";
import { FOND_PALETTE, PALETTE, contraste, formaterRapport, teinte, usagePermis } from "../identite/palette";
import { POLICES } from "../identite/polices";
import { LATITUDE_TOULON, LONGITUDE_TOULON, Releve } from "../identite/Releve";
import type { Mesure } from "../identite/Releve";
import { StylesIdentite } from "../identite/StylesIdentite";
import { Planche, SectionVitrine } from "./kit";

type StyleAvecVariables = CSSProperties & Record<`--${string}`, string>;

/* Textes d'essai : é è ê à ç œ dans le titre, une phrase courante dessous. */
const TITRE_ESSAI = "Fenêtre, cœur, façade : à chaque écran sa règle";
const TEXTE_ESSAI = "Sa fenêtre donne sur la rade ; à l'aube, un cœur de néon éclaire la façade.";

const RELEVE_POLICE: readonly Mesure[] = [
  { libelle: "Latitude N", valeur: LATITUDE_TOULON },
  { libelle: "Code", valeur: "A1", ton: "accent" },
  { libelle: "État", valeur: "XX" },
];

const RELEVE_PALETTE: readonly Mesure[] = [
  { libelle: "Latitude N", valeur: LATITUDE_TOULON },
  { libelle: "Longitude E", valeur: LONGITUDE_TOULON },
  { libelle: "Code", valeur: "A1", ton: "accent" },
  { libelle: "État", valeur: "XX", ton: "alerte" },
];

const CURSEURS: readonly { nom: string; curseur: string; forme?: FormeCurseur; note: string }[] = [
  { nom: "Repos", curseur: "visee", forme: "visee", note: "Repli : crosshair" },
  { nom: "Cliquable", curseur: "crochets", forme: "crochets", note: "Repli : pointer" },
  { nom: "Saisie", curseur: "text", note: "Curseur du système" },
  { nom: "Désactivé", curseur: "not-allowed", note: "Curseur du système" },
];

function PlanchePolices() {
  return (
    <Planche nom="Polices" note="Texte en Saira. Titres au choix, module en haut à droite.">
      <div className="space-y-6">
        {POLICES.map((p) => (
          <Panneau key={p.id} as="article" coupe="m" className={`p-6 md:p-8 ${p.classe}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/[0.08] pb-4">
              <h4 className={`type-h3 text-white ${p.classe}`}>{p.nom}</h4>
              <p className="type-caption text-(--cs-texte-3)">
                {p.trait} · {p.graisses}
              </p>
            </div>
            <div className="mt-6">
              <Releve mesures={RELEVE_POLICE} />
            </div>
            <p className={`type-h2 mt-10 text-white ${p.classe}`}>{TITRE_ESSAI}</p>
            <p className="type-body mt-3 text-(--cs-texte-2)">{TEXTE_ESSAI}</p>
          </Panneau>
        ))}
      </div>
    </Planche>
  );
}

function PlanchePalette() {
  const glace = teinte("Glace");
  const craie = teinte("Craie");
  const filet = teinte("Filet");
  const alerte = teinte("Alerte");
  const styleEchantillon: StyleAvecVariables = {
    "--cs-bord": filet,
    "--rl-libelle": glace,
    "--rl-valeur": craie,
    "--rl-filet": filet,
    "--rl-accent": teinte("Paille"),
    "--rl-alerte": alerte,
  };

  return (
    <Planche nom="Palette proposée" note="Contraste mesuré contre Nuit.">
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PALETTE.map((t) => {
          const estFond = t.hex === FOND_PALETTE;
          const rapport = contraste(t.hex, FOND_PALETTE);
          return (
            <li key={t.nom}>
              <Panneau coupe="s" className="p-4">
                <div aria-hidden="true" className="flex h-14 border border-white/10">
                  <span className="block flex-1" style={{ background: t.hex }} />
                  {estFond ? null : rapport >= 4.5 ? (
                    <span
                      className="type-h3 flex flex-1 items-center justify-center"
                      style={{ background: FOND_PALETTE, color: t.hex }}
                    >
                      Aa 43
                    </span>
                  ) : (
                    <span className="flex flex-1 items-center px-4" style={{ background: FOND_PALETTE }}>
                      <span className="block h-px w-full" style={{ background: t.hex }} />
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="type-body font-semibold text-white">{t.nom}</p>
                  <p className="type-caption tabular-nums text-(--cs-texte-2)">{t.hex}</p>
                </div>
                <p className="type-caption text-(--cs-texte-3)">{t.role}</p>
                <p className="type-caption mt-3 tabular-nums text-(--cs-neon)">
                  {estFond ? "Fond de référence" : `${formaterRapport(rapport)} · ${usagePermis(rapport)}`}
                </p>
              </Panneau>
            </li>
          );
        })}
      </ul>

      <div className="csPanneau csCoupe mt-8" data-coupe="l" style={styleEchantillon}>
        <StylesConsole />
        <StylesIdentite />
        <span aria-hidden="true" className="csIdEchFond" style={{ background: FOND_PALETTE }} />
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />
        <div className="p-6 md:p-10">
          <p className="type-caption pb-8 uppercase tracking-[0.24em]" style={{ color: glace }}>
            Relevé · Toulon
          </p>
          <Releve mesures={RELEVE_PALETTE} />
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5" style={{ borderColor: filet }}>
            <span aria-hidden="true" className="csIdAlerteRepere" style={{ background: alerte }} />
            <p className="type-caption uppercase tracking-[0.24em]" style={{ color: alerte }}>
              Alerte
            </p>
            <p className="type-body" style={{ color: craie }}>
              Liaison interrompue
            </p>
          </div>
        </div>
      </div>
    </Planche>
  );
}

function PlancheCurseurs() {
  return (
    <Planche nom="Curseurs" note="Survoler une tuile pour l'essayer.">
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CURSEURS.map((c) => (
          <li key={c.nom} className="csIdEssai" data-curseur={c.curseur}>
            <Panneau coupe="s" className="h-full p-5">
              <div className="flex h-[62px] items-center gap-3">
                {c.forme ? (
                  <>
                    <ApercuCurseur forme={c.forme} echelle={2} fond={FOND_PALETTE} />
                    <ApercuCurseur forme={c.forme} echelle={2} fond={teinte("Craie")} />
                  </>
                ) : (
                  <p className="type-body tabular-nums text-(--cs-neon)">{c.curseur}</p>
                )}
              </div>
              <p className="type-body mt-4 font-semibold text-white">{c.nom}</p>
              <p className="type-caption text-(--cs-texte-3)">{c.note}</p>
            </Panneau>
          </li>
        ))}
      </ul>
    </Planche>
  );
}

export function VitrineIdentite() {
  return (
    <SectionVitrine id="identite" index={16} surtitre="Identité" titre="Typographie, palette et curseurs" alterne>
      <PlanchePolices />
      <PlanchePalette />
      <PlancheCurseurs />
    </SectionVitrine>
  );
}
