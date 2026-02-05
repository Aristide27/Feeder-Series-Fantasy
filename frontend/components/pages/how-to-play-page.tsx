"use client";

import React from "react";
import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-slate-900/40 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-accent to-accent/80 rounded-full" />
            <span className="text-accent text-sm font-semibold tracking-wider uppercase">
              Guide de démarrage
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            Comment jouer
          </h1>
          
          <p className="text-xl text-slate-300 max-w-6xl leading-relaxed">
            Bienvenue sur <span className="text-accent font-semibold">Feeder Series Fantasy F2</span>. 
            Vis chaque week-end de Formule 2 comme un directeur d'équipe. Choisis tes pilotes, 
            sélectionne tes écuries, respecte le budget, affronte d'autres joueurs selon les 
            performances réelles des courses.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-6">
            {/* Step 1 */}
            <StepCard
              number={1}
              title="Crée ton équipe"
              description="Construis ta composition en respectant les contraintes budgétaires"
            >
              <div className="space-y-4">
                <InfoItem 
                  label="Nom d'équipe"
                  description="Choisis un nom unique qui te représente."
                />
                <InfoItem 
                  label="2 écuries"
                  description="Sélectionne deux constructeurs pour ton équipe."
                />
                <InfoItem 
                  label="5 pilotes"
                  description="Compose ton line-up avec cinq pilotes de ton choix."
                />
                <InfoItem 
                  label="Budget à respecter"
                  description="Optimise ta composition dans la limite du budget alloué."
                />
                
                <div className="mt-6 p-4 bg-amber-950/30 border border-amber-900/40 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-200 mb-1">Astuce stratégique</p>
                      <p className="text-sm text-amber-300/80">
                        La régularité paie souvent mieux que les gros noms. Un pilote constant 
                        peut rapporter plus de points qu'une pilote prometteur inconstant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StepCard>

            {/* Step 2 */}
            <StepCard
              number={2}
              title="Rejoins ou crée une ligue"
              description="Affronte tes amis ou mesure-toi au monde entier."
            >
              <div className="space-y-4">
                <InfoItem 
                  label="Ligue privée"
                  description="Rejoins une ligue existante avec un code d'invitation."
                />
                <InfoItem 
                  label="Créer une ligue"
                  description="Lance ta propre compétition et invite tes amis à te défier."
                />
                <InfoItem 
                  label="Classement mondial"
                  description="Compare-toi automatiquement aux meilleurs joueurs du monde."
                />
              </div>
            </StepCard>

            {/* Step 3 */}
            <StepCard
              number={3}
              title="Suis les courses"
              description="Tes points s'actualisent automatiquement après chaque session"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <SessionPill label="Qualifications" />
                  <SessionPill label="Course sprint" />
                  <SessionPill label="Course principale" />
                </div>
                
                <InfoItem 
                  label="Points automatiques"
                  description="Les points sont calculés à partir des résultats officiels à la fin du week-end."
                />
                <InfoItem 
                  label="Suivi en temps réel"
                  description="Classements et totaux mis à jour le lundi matin."
                />
              </div>
            </StepCard>

            {/* Step 4 */}
            <StepCard
              number={4}
              title="Analyse et optimise"
              description="Utilise les statistiques pour affiner ta stratégie"
            >
              <div className="space-y-4">
                <InfoItem 
                  label="Forme récente"
                  description="Étudie les performances des pilotes et écuries sur les dernières courses."
                />
                <InfoItem 
                  label="Performance par circuit"
                  description="Certains pilotes excellent sur des tracés spécifiques."
                />
                <InfoItem 
                  label="Arbitrages budget"
                  description="Achète bas, revends haut pour augmenter le budget de ton équipe."
                />
              </div>
            </StepCard>

            {/* Step 5 */}
            <StepCard
              number={5}
              title="Gagne la saison"
              description="Accumule les points et domine ton classement"
            >
              <div className="space-y-4">
                <InfoItem 
                  label="Victoire en ligue"
                  description="Le meilleur score de ta ligue remporte le championnat privé."
                />
                <InfoItem 
                  label="Champion mondial"
                  description="Le meilleur score global devient champion FSF Série 2/Tier 2 de la saison."
                />
                
                <div className="mt-6 p-6 bg-gradient-to-br from-accent/20 to-slate-900/30 border border-accent/25 rounded-lg">

                  <p className="text-slate-200 text-center font-medium">
                    Prêt à dominer le championnat ?
                  </p>
                </div>
              </div>
            </StepCard>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            <SidebarCard title="Raccourcis rapides">
              <div className="space-y-3">
                <QuickLink label="Créer mon équipe" href="/my-team" />
                <QuickLink label="Rejoindre une ligue" href="/leagues" />
                <QuickLink label="Voir le barème des points" href="/rules#points" />
                <QuickLink label="Règles complètes" href="/rules" />
              </div>
            </SidebarCard>

            <SidebarCard title="Important à savoir">
              <div className="space-y-4 text-sm text-slate-300">
                <ImportantNote 
                  text="Les prix des pilotes et écuries évoluent après chaque week-end."
                />
                <ImportantNote 
                  text="Une fois l'équipe verrouillée, tu ne peux plus la modifier pour le week-end."
                />
                <ImportantNote 
                  text="Les points sont calculés d’après les résultats officiels publiés par la FIA."
                />
              </div>
            </SidebarCard>

            <SidebarCard title="Prêt à démarrer ?">
              <p className="text-sm text-slate-300 mb-4">
                Tout est clair ? Lance-toi dans l'aventure et construis l'équipe qui dominera la saison.
              </p>
              <Link 
                href="/team/create"
                className="block w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 text-center"
              >
                Créer mon équipe
              </Link>
            </SidebarCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

function StepCard({ number, title, description, children }: StepCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8 hover:border-slate-700/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
            <span className="text-2xl font-bold text-white">{number}</span>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400">{description}</p>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  description: string;
}

function InfoItem({ label, description }: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1.5 flex-shrink-0">
        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
      </div>
      <div>
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function SessionPill({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
}

function SidebarCard({ title, children }: SidebarCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function QuickLink({ label, href }: { label: string; href: string }) {
  return (
    <Link 
      href={href}
      className="block px-4 py-2.5 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-700/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200"
    >
      {label}
    </Link>
  );
}

function ImportantNote({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-accent flex-shrink-0">•</span>
      <p>{text}</p>
    </div>
  );
}