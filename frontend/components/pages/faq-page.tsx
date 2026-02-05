"use client";

import React from "react";
import Link from "next/link";

export default function FaqPage() {
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
              Questions fréquentes
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            FAQ
          </h1>
          
          <p className="text-xl text-slate-300 max-w-6xl leading-relaxed">
            Retrouve ici les réponses aux questions les plus fréquentes sur le fonctionnement 
            du jeu, les règles, les transferts, et bien plus encore.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-6">
            
            {/* Section: Général */}
            <FaqSection 
              title="Général" 
              badge="Bases"
            >
              <FaqItem
                question="Qu'est-ce que Feeder Series Fantasy F2 ?"
                answer="Feeder Series Fantasy F2 est un jeu fantasy basé sur le championnat de Formule 2. Tu crées une équipe composée de pilotes et d'écuries, et tu marques des points selon les performances réelles en piste."
              />
              
              <FaqItem
                question="Le jeu est-il officiel ?"
                answer="Non. Feeder Series Fantasy F2 est un projet indépendant, créé par des fans, sans affiliation avec la FIA, Formula 1, Formula 2, Formula 3 ou F1 Academy."
              />
              
              <FaqItem
                question="Le jeu est-il gratuit ?"
                answer="Oui, Feeder Series Fantasy F2 est entièrement gratuit."
              />
              
              <FaqItem
                question="Puis-je commencer à jouer si la saison a déjà commencé ?"
                answer="Oui. Tu peux rejoindre le jeu à n'importe quel moment de la saison. Si un week-end est déjà en cours ou terminé, ton équipe commencera à marquer des points à partir du prochain week-end de course."
              />
            </FaqSection>

            {/* Section: Équipe & Sélections */}
            <FaqSection 
              title="Équipe & Sélections" 
              badge="Composition"
            >
              <FaqItem
                question="Combien d'équipes puis-je créer ?"
                answer="Une seule équipe fantasy par utilisateur."
              />
              
              <FaqItem
                question="Quand mon équipe est-elle verrouillée ?"
                answer="Ton équipe est verrouillée au début officiel du week-end de course. Une fois ce moment passé, aucune modification n'est possible jusqu'au week-end suivant."
              />
              
              <FaqItem
                question="Puis-je modifier mon équipe pendant la saison ?"
                answer="Oui, tant que la période de sélection du prochain week-end est ouverte."
              />
            </FaqSection>

            {/* Section: Transferts */}
            <FaqSection 
              title="Transferts" 
              badge="A faire"
              comingSoon
            >
              <FaqItem
                question="Comment fonctionnent les transferts ?"
                answer="Fonctionnalité en cours de développement."
                isComingSoon
              />
              
              <div className="mt-4 p-5 bg-blue-950/20 border border-blue-900/30 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Règles prévues
                </h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Tu disposeras de 2 transferts gratuits avant chaque week-end de course</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Chaque transfert supplémentaire entraînera une pénalité de -10 points</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>1 transfert gratuit non utilisé sera reporté au week-end suivant</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Les transferts reportés ne s'accumulent pas sur plusieurs courses</span>
                  </li>
                </ul>
              </div>
            </FaqSection>

            {/* Section: Budget & Prix */}
            <FaqSection 
              title="Budget & Prix" 
              badge="Économie"
            >
              <FaqItem
                question="Quel est le budget de départ ?"
                answer="Chaque joueur dispose d'un budget initial de 100 millions pour composer son équipe."
              />
              
              <FaqItem
                question="Comment sont définis les prix des pilotes et des écuries ?"
                answer="Les prix sont calculés automatiquement à partir des performances réelles en piste."
              />
              
              <FaqItem
                question="Quand les prix évoluent-ils ?"
                answer="Les prix évoluent après chaque week-end de course."
              />
              
              <FaqItem
                question="Les changements de prix affectent-ils un week-end déjà commencé ?"
                answer="Non. Une fois ton équipe verrouillée pour un week-end, les prix restent fixes jusqu'à la fin de ce week-end."
              />
              
              <FaqItem
                question="Pourquoi les prix changent-ils ?"
                answer="Les variations de prix reflètent la forme des pilotes et des écuries afin d'encourager une stratégie dynamique tout au long de la saison."
              />
            </FaqSection>

            {/* Section: Points & Résultats */}
            <FaqSection 
              title="Points & Résultats" 
              badge="Scoring"
            >
              <FaqItem
                question="Comment sont attribués les points ?"
                answer="Les points sont attribués selon les performances réelles lors des qualifications, de la Sprint Race et de la Feature Race. Le barème détaillé est disponible dans la section Règles du jeu."
                linkText="Voir le barème complet"
                linkHref="/rules#points"
              />
              
              <FaqItem
                question="Quand les points sont-ils mis à jour ?"
                answer="Les points sont calculés automatiquement après chaque session officielle, une fois les résultats validés. Un score provisoire peut être affiché avant validation finale."
              />
              
              <FaqItem
                question="Que signifient DNS, DNF et DSQ ?"
              >
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex gap-3">
                    DNS : Did Not Start (pilote non partant)
                  </div>
                  <div className="flex gap-3">
                    DNF : Did Not Finish (abandon)
                  </div>
                  <div className="flex gap-3">
                    DSQ : Disqualified (disqualification)
                  </div>
                </div>
              </FaqItem>
            </FaqSection>

            {/* Section: Cas particuliers */}
            <FaqSection 
              title="Cas particuliers" 
              badge="Exceptions"
            >
              <FaqItem
                question="Que se passe-t-il si une course est annulée ?"
                answer="Aucun point n'est attribué pour cette course."
              />
              
              <FaqItem
                question="Que se passe-t-il si une course est raccourcie ou interrompue ?"
                answer="Les points sont attribués uniquement selon les résultats officiellement validés par la Formule 2."
              />
              
              <FaqItem
                question="Que se passe-t-il si un pilote est remplacé ?"
                answer="Fonctionnalité prévue. La gestion des pilotes remplacés sera automatique et équitable, afin que les joueurs ne soient pas pénalisés par des changements indépendants de leur volonté."
                isComingSoon
              />
            </FaqSection>

            {/* Section: Ligues & Classements */}
            <FaqSection 
              title="Ligues & Classements" 
              badge="Compétition"
            >
              <FaqItem
                question="Qu'est-ce qu'une ligue ?"
                answer="Une ligue est un groupe de joueurs qui s'affrontent dans un classement commun."
              />
              
              <FaqItem
                question="Puis-je rejoindre plusieurs ligues ?"
                answer="Oui. La même équipe fantasy peut participer à plusieurs ligues en parallèle."
              />
              
              <FaqItem
                question="Comment sont départagées les égalités au classement ?"
              >
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="mb-3">En cas d'égalité de points :</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-300">1</span>
                      </div>
                      <span>Meilleur score en Feature Race</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-300">2</span>
                      </div>
                      <span>Meilleur score en Sprint Race</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-300">3</span>
                      </div>
                      <span>Meilleure qualification</span>
                    </div>
                  </div>
                </div>
              </FaqItem>
            </FaqSection>

            {/* Section: Fair-play & Support */}
            <FaqSection 
              title="Fair-play & Support" 
              badge="Aide"
            >
              <FaqItem
                question="Les résultats peuvent-ils être modifiés après coup ?"
                answer="Non. Il n'y a aucune modification rétroactive des résultats ou des points."
              />
              
              <FaqItem
                question="Pourquoi mes points semblent incorrects ?"
                answer="Vérifie le barème dans la page Règles du jeu. Si le doute persiste, contacte le support via la page Contact."
                linkText="Voir les règles"
                linkHref="/rules"
              />
              
              <FaqItem
                question="Comment contacter l'équipe du jeu ?"
                answer="Via la page Contact."
                linkText="Nous contacter"
                linkHref="/contact"
              />
            </FaqSection>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            <SidebarCard title="Besoin d'aide ?">
              <p className="text-sm text-slate-300 mb-4">
                Tu ne trouves pas ta réponse ? N'hésite pas à nous contacter.
              </p>
              <Link 
                href="/contact"
                className="block w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 text-center"
              >
                Contacter le support
              </Link>
            </SidebarCard>

            <SidebarCard title="Liens utiles">
              <div className="space-y-3">
                <QuickLink label="Comment jouer" href="/how-to-play" />
                <QuickLink label="Règles du jeu" href="/rules" />
                <QuickLink label="Créer mon équipe" href="/my-team" />
              </div>
            </SidebarCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components

interface FaqSectionProps {
  title: string;
  badge: string;
  children: React.ReactNode;
  comingSoon?: boolean;
}

function FaqSection({ title, badge, children, comingSoon }: FaqSectionProps) {
  return (
    <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8 hover:border-slate-700/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl"></span>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          
          <span className={`px-3 py-1 ${comingSoon ? 'bg-amber-950/40 border-amber-900/50 text-amber-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'} border text-xs font-semibold rounded-md uppercase tracking-wide`}>
            {badge}
          </span>
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FaqItemProps {
  question: string;
  answer?: string;
  children?: React.ReactNode;
  linkText?: string;
  linkHref?: string;
  isComingSoon?: boolean;
}

function FaqItem({ question, answer, children, linkText, linkHref, isComingSoon }: FaqItemProps) {
  return (
    <div className="pb-4 border-b border-slate-800/30 last:border-0 last:pb-0">
      <h3 className="text-base font-semibold text-white mb-2 flex items-start gap-2">
        <span className="text-red-500 mt-1">Q.</span>
        <span>{question}</span>
      </h3>
      
      {isComingSoon && (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-950/30 border border-amber-900/40 rounded text-xs text-amber-300 mb-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          À venir
        </div>
      )}
      
      {answer && (
        <p className="text-sm text-slate-300 leading-relaxed ml-6">
          {answer}
        </p>
      )}
      
      {children && (
        <div className="ml-6">
          {children}
        </div>
      )}
      
      {linkText && linkHref && (
        <Link 
          href={linkHref}
          className="inline-flex items-center gap-1 mt-2 ml-6 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <span>{linkText}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
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

function ComingSoonItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-amber-400 flex-shrink-0">â±</span>
      <p>{text}</p>
    </div>
  );
}