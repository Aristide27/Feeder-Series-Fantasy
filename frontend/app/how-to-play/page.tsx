"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HowToPlayPage() {
  const t = useTranslations("howToPlay");
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
              {t("badge")}
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            {t("title")}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-6xl leading-relaxed">
            {t("description")}
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
              title={t("steps.step1.title")}
              description={t("steps.step1.description")}
            >
              <div className="space-y-4">
                <InfoItem 
                  label={t("steps.step1.teamName.label")}
                  description={t("steps.step1.teamName.description")}
                />
                <InfoItem 
                  label={t("steps.step1.constructors.label")}
                  description={t("steps.step1.constructors.description")}
                />
                <InfoItem 
                  label={t("steps.step1.drivers.label")}
                  description={t("steps.step1.drivers.description")}
                />
                <InfoItem 
                  label={t("steps.step1.captain.label")}
                  description={t("steps.step1.captain.description")}
                />
                <InfoItem 
                  label={t("steps.step1.budget.label")}
                  description={t("steps.step1.budget.description")}
                />
                
                <div className="mt-6 p-4 bg-amber-950/30 border border-amber-900/40 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-200 mb-1">{t("steps.step1.tip.title")}</p>
                      <p className="text-sm text-amber-300/80">
                        {t("steps.step1.tip.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StepCard>

            {/* Step 2 */}
            <StepCard
              number={2}
              title={t("steps.step2.title")}
              description={t("steps.step2.description")}
            >
              <div className="space-y-4">
                <InfoItem 
                  label={t("steps.step2.privateLeague.label")}
                  description={t("steps.step2.privateLeague.description")}
                />
                <InfoItem 
                  label={t("steps.step2.createLeague.label")}
                  description={t("steps.step2.createLeague.description")}
                />
                <InfoItem 
                  label={t("steps.step2.worldRanking.label")}
                  description={t("steps.step2.worldRanking.description")}
                />
              </div>
            </StepCard>

            {/* Step 3 */}
            <StepCard
              number={3}
              title={t("steps.step3.title")}
              description={t("steps.step3.description")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <SessionPill label={t("steps.step3.qualifying")} />
                  <SessionPill label={t("steps.step3.sprintRace")} />
                  <SessionPill label={t("steps.step3.featureRace")} />
                </div>
                
                <InfoItem 
                  label={t("steps.step3.automaticPoints.label")}
                  description={t("steps.step3.automaticPoints.description")}
                />
                <InfoItem 
                  label={t("steps.step3.automaticCalc.label")}
                  description={t("steps.step3.automaticCalc.description")}
                />
              </div>
            </StepCard>

            {/* Step 4 */}
            <StepCard
              number={4}
              title={t("steps.step4.title")}
              description={t("steps.step4.description")}
            >
              <div className="space-y-4">
                <InfoItem 
                  label={t("steps.step4.recentForm.label")}
                  description={t("steps.step4.recentForm.description")}
                />
                <InfoItem 
                  label={t("steps.step4.circuitPerf.label")}
                  description={t("steps.step4.circuitPerf.description")}
                />
                <InfoItem 
                  label={t("steps.step4.priceEvolution.label")}
                  description={t("steps.step4.priceEvolution.description")}
                />
              </div>
            </StepCard>

            {/* Step 5 */}
            <StepCard
              number={5}
              title={t("steps.step5.title")}
              description={t("steps.step5.description")}
            >
              <div className="space-y-4">
                <InfoItem 
                  label={t("steps.step5.leagueWin.label")}
                  description={t("steps.step5.leagueWin.description")}
                />
                <InfoItem 
                  label={t("steps.step5.worldChamp.label")}
                  description={t("steps.step5.worldChamp.description")}
                />
                
                <div className="mt-6 p-6 bg-gradient-to-br from-accent/20 to-slate-900/30 border border-accent/25 rounded-lg">

                  <p className="text-slate-200 text-center font-medium">
                    {t("steps.step5.cta")}
                  </p>
                </div>
              </div>
            </StepCard>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            <SidebarCard title={t("sidebar.shortcuts.title")}>
              <div className="space-y-3">
                <QuickLink label={t("sidebar.shortcuts.createTeam")} href="/leagues" />
                <QuickLink label={t("sidebar.shortcuts.joinLeague")} href="/leagues" />
                <QuickLink label={t("sidebar.shortcuts.pointsScale")} href="/rules#points" />
                <QuickLink label={t("sidebar.shortcuts.fullRules")} href="/rules" />
              </div>
            </SidebarCard>

            <SidebarCard title={t("sidebar.important.title")}>
              <div className="space-y-4 text-sm text-slate-300">
                <ImportantNote 
                  text={t("sidebar.important.note1")}
                />
                <ImportantNote 
                  text={t("sidebar.important.note2")}
                />
                <ImportantNote 
                  text={t("sidebar.important.note3")}
                />
              </div>
            </SidebarCard>

            <SidebarCard title={t("sidebar.ready.title")}>
              <p className="text-sm text-slate-300 mb-4">
                {t("sidebar.ready.description")}
              </p>
              <Link 
                href="/leagues"
                className="block w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 text-center"
              >
                {t("sidebar.ready.cta")}
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