"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RulesPage() {
  const t = useTranslations("rules");

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
              {t("hero.badge")}
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            {t("hero.title")}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-6xl leading-relaxed">
            {t("hero.description")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16 space-y-6">
        
        {/* Section 1: Composition */}
        <RuleSection 
          number={1}
          title={t("sections.s1.title")}
          badge={t("sections.s1.badge")}
        >
          <div className="space-y-4">
            <RuleItem 
              label={t("sections.s1.constructors.label")}
              description={t("sections.s1.constructors.description")}
            />
            <RuleItem 
              label={t("sections.s1.drivers.label")}
              description={t("sections.s1.drivers.description")}
            />
            <RuleItem 
              label={t("sections.s1.captain.label")}
              description={t("sections.s1.captain.description")}
            />
            <RuleItem 
              label={t("sections.s1.budget.label")}
              description={t("sections.s1.budget.description")}
            />
            <RuleItem 
              label={t("sections.s1.oneTeam.label")}
              description={t("sections.s1.oneTeam.description")}
            />
          </div>
        </RuleSection>

        {/* Section 2: Budget */}
        <RuleSection 
          number={2}
          title={t("sections.s2.title")}
          badge={t("sections.s2.badge")}
        >
          <div className="space-y-4">
            <RuleItem 
              label={t("sections.s2.prices.label")}
              description={t("sections.s2.prices.description")}
            />
            <RuleItem 
              label={t("sections.s2.evolution.label")}
              description={t("sections.s2.evolution.description")}
            />
            <RuleItem 
              label={t("sections.s2.locked.label")}
              description={t("sections.s2.locked.description")}
            />
          
          </div>

          <div className="mt-6 p-4 bg-blue-950/30 border border-blue-900/40 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-200 mb-1">{t("sections.s2.tip.title")}</p>
                <p className="text-sm text-blue-300/80">
                  {t("sections.s2.tip.description")}
                </p>
              </div>
            </div>
          </div>
        </RuleSection>

        {/* Section 3: Points Pilotes */}
        <div id="points" className="scroll-mt-24">
          <RuleSection 
            number={3}
            title={t("sections.s3.title")}
            badge={t("sections.s3.badge")}
          >
            <div className="space-y-4">
            <RuleItem 
              label={t("sections.s3.driverSum.label")}
              description={t("sections.s3.driverSum.description")}
            />
            <div className="space-y-6">
            </div>  
              {/* Qualifications */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-950/40 border border-amber-900/50 text-amber-300 text-xs font-bold rounded-md uppercase tracking-wide">
                    {t("sections.s3.quali")}
                  </span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <PointItem position="1st place" points={10} />
                  <PointItem position="2nd place" points={9} />
                  <PointItem position="3rd place" points={8} />
                  <PointItem position="4th place" points={7} />
                  <PointItem position="5th place" points={6} />
                  <PointItem position="6th place" points={5} />
                  <PointItem position="7th place" points={4} />
                  <PointItem position="8th place" points={3} />
                  <PointItem position="9th place" points={2} />
                  <PointItem position="10th place" points={1} />
                  <PointItem position="11th - 20th place" points={0} />
                  <PointItem position="No time set" points={-5} negative />
                  <PointItem position="Disqualified" points={-5} negative />
                </div>
              </div>

              {/* Sprint Race */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-950/40 border border-purple-900/50 text-purple-300 text-xs font-bold rounded-md uppercase tracking-wide">
                    {t("sections.s3.sprint")}
                  </span>
                </h4>
                
                <div className="space-y-4">              
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2"></p>
                    <div className="grid grid-cols-2 gap-3">
                      <PointItem position="1st place" points={10} />
                      <PointItem position="2nd place" points={8} />
                      <PointItem position="3rd place" points={6} />
                      <PointItem position="4th place" points={5} />
                      <PointItem position="5th place" points={4} />
                      <PointItem position="6th place" points={3} />
                      <PointItem position="7th place" points={2} />
                      <PointItem position="8th place" points={1} />
                      <PointItem position="9th - 20th place" points={0} />
                      <PointItem position="Fastest Lap" points={5} />
                      <PointItem position="DNF / DNS" points={-20} negative />
                      <PointItem position="Disqualified" points={-20} negative />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Race */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-bold rounded-md uppercase tracking-wide">
                    {t("sections.s3.feature")}
                  </span>
                </h4>
                
                <div className="space-y-4">              
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">{t("sections.s3.featureFinalResult")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <PointItem position="1st place" points={25} />
                      <PointItem position="2nd place" points={18} />
                      <PointItem position="3rd place" points={15} />
                      <PointItem position="4th place" points={12} />
                      <PointItem position="5th place" points={10} />
                      <PointItem position="6th place" points={8} />
                      <PointItem position="7th place" points={6} />
                      <PointItem position="8th place" points={4} />
                      <PointItem position="9th place" points={2} />
                      <PointItem position="10th place" points={1} />
                      <PointItem position="11th - 20th place" points={0} />
                      <PointItem position="Fastest Lap" points={10} />
                      <PointItem position="DNF / DNS" points={-20} negative />
                      <PointItem position="Disqualified" points={-20} negative />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg text-xs text-slate-400">
                  {t("sections.s3.pitlane")}
                </div>
                <div className="p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg text-xs text-slate-400">
                  {t("sections.s3.dnfNote")}
                </div>
              </div>
            </div>
          </RuleSection>
        </div>

        {/* Section 4: Points Écuries */}
        <RuleSection 
          number={4}
          title={t("sections.s4.title")}
          badge={t("sections.s4.badge")}
        >
          <div className="space-y-4">
            <RuleItem 
              label={t("sections.s4.constructorSum.label")}
              description={t("sections.s4.constructorSum.description")}
            />
            
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-semibold text-white">{t("sections.s4.bonusTitle")}</h4>
              <div className="grid grid-cols-2 gap-3">
                <PointItem position={t("sections.s4.bonus.bothTop10")} points={10} />
                <PointItem position={t("sections.s4.bonus.oneTop10")} points={5} />
                <PointItem position={t("sections.s4.bonus.bothTop16")} points={3} />
                <PointItem position={t("sections.s4.bonus.oneTop16")} points={1} />
                <PointItem position={t("sections.s4.bonus.bothOut16")} points={-1} negative />
              </div>
            </div>
          </div>
        </RuleSection>

        {/* Section 5: Classements */}
        <RuleSection 
          number={5}
          title={t("sections.s5.title")}
          badge={t("sections.s5.badge")}
        >
          <div className="mb-6 p-4 bg-yellow-950/30 border border-yellow-900/40 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-200 mb-1">{t("sections.s5.captainBonus.title")}</p>
                <p className="text-sm text-yellow-300/80">
                  {t("sections.s5.captainBonus.description")}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <RuleItem 
              label={t("sections.s5.weekend.label")}
              description={t("sections.s5.weekend.description")}
            />
            <RuleItem 
              label={t("sections.s5.league.label")}
              description={t("sections.s5.league.description")}
            />
            <RuleItem 
              label={t("sections.s5.world.label")}
              description={t("sections.s5.world.description")}
            />
            
            {/* <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-white">Départage en cas d'égalité</h4>
              <p className="text-sm text-slate-300">
                En cas d'égalité de points, le classement se détermine dans l'ordre suivant :
              </p>
              <div className="space-y-2">
                <DepartageItem number={1} text="Total des points en Feature Race" />
                <DepartageItem number={2} text="Total des points en Sprint Race" />
                <DepartageItem number={3} text="Total des points en Qualifications" />
              </div>
            </div> */}
          </div>
        </RuleSection>

        {/* Section 6: Cas particuliers */}
        <RuleSection 
          number={6}
          title={t("sections.s6.title")}
          badge={t("sections.s6.badge")}
        >
          <div className="space-y-4">
            <RuleItem 
              label={t("sections.s6.cancelled.label")}
              description={t("sections.s6.cancelled.description")}
            />
            
            {/* <div className="mt-6 p-5 bg-red-950/20 border border-red-900/30 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Disqualifications
              </h4>
              <p className="text-sm text-slate-300">
                Les pénalités supplémentaires pour disqualification sont désormais appliquées au 
                <span className="font-semibold text-white"> constructeur </span> 
                et non au pilote. Les pilotes disqualifiés ne reçoivent que la pénalité Not Classified 
                (-20 points pour la course au lieu des -25 points précédents).
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  • Le constructeur reçoit une pénalité supplémentaire de 
                  <span className="font-semibold text-red-300"> -10 points </span> 
                  pour une disqualification en course/sprint, résultant en 
                  <span className="font-semibold text-red-300"> -30 points </span> 
                  comme contribution du pilote au total de la course/sprint.
                </p>
                <p>
                  • Le constructeur reçoit une pénalité supplémentaire de 
                  <span className="font-semibold text-red-300"> -5 points </span> 
                  pour une disqualification en qualifications, résultant en 
                  <span className="font-semibold text-red-300"> -10 points </span> 
                  comme contribution du pilote au total des qualifications.
                </p>
              </div>
            </div> */}
            
            <RuleItem 
              label={t("sections.s6.teamChange.label")}
              description={t("sections.s6.teamChange.description")}
            />
            <RuleItem 
              label={t("sections.s6.finalDecision.label")}
              description={t("sections.s6.finalDecision.description")}
            />
          </div>
        </RuleSection>

        {/* Summary Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800/50 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-4">{t("summary.title")}</h3>
          <p className="text-slate-300 mb-6 leading-relaxed">
            {t("summary.description")}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <p className="text-sm text-slate-400">
              {t("summary.faqText")}{" "}
              <Link
                href="/faq"
                className="font-medium text-white/90 underline underline-offset-4 hover:text-white transition-colors"
              >
                {t("summary.faqLink")}
              </Link>{" "}
              {t("summary.orText")}{" "}
              <Link
                href="/contact"
                className="font-medium text-white/90 underline underline-offset-4 hover:text-white transition-colors"
              >
                {t("summary.contactLink")}
              </Link>
              {" "}{t("summary.supportText")}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Components

interface RuleSectionProps {
  number: number;
  title: string;
  badge: string;
  children: React.ReactNode;
}

function RuleSection({ number, title, badge, children }: RuleSectionProps) {
  return (
    <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8 hover:border-slate-700/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <span className="text-2xl font-bold text-white">{number}</span>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            </div>
          </div>
          
          <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-semibold rounded-md uppercase tracking-wide">
            {badge}
          </span>
        </div>
        
        {children}
      </div>
    </div>
  );
}

interface RuleItemProps {
  label: string;
  description: string;
}

function RuleItem({ label, description }: RuleItemProps) {
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

interface PointItemProps {
  position: string;
  points: number;
  negative?: boolean;
  suffix?: string;
}

function PointItem({ position, points, negative, suffix }: PointItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 border border-slate-700/30 rounded-lg">
      <span className="text-sm text-slate-300">{position}</span>
      <span className={`text-sm font-bold ${negative ? 'text-red-400' : 'text-emerald-400'}`}>
        {points > 0 && !negative ? '+' : ''}{points} {suffix || ''}
      </span>
    </div>
  );
}

interface DepartageItemProps {
  number: number;
  text: string;
}

function DepartageItem({ number, text }: DepartageItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/20 border border-slate-700/30 rounded-lg">
      <div className="flex-shrink-0 w-6 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
        <span className="text-xs font-bold text-slate-300">{number}</span>
      </div>
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}