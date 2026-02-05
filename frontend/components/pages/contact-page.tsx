"use client";
import { useState } from "react";
import Link from "next/link";
import React from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, subject, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Erreur lors de l'envoi");
      }

      setSent(true);
      
      // Reset après 5 secondes
      setTimeout(() => {
        setSent(false);
        setFirstName("");
        setEmail("");
        setMessage("");
        setSubject("");
      }, 5000);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  }

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
              Nous contacter
            </span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            Contact
          </h1>
          
          <p className="text-xl text-slate-300 leading-relaxed">
            Tu peux nous écrire pour signaler des bugs, 
            proposer des améliorations, donner ton avis 
            sur l'expérience de jeu, ou poser une question.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {sent ? (
          // Success Message
          <div className="relative bg-gradient-to-br from-emerald-950/40 to-slate-900/40 border border-emerald-900/30 rounded-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent rounded-xl" />
            
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Message envoyé !</h2>
                <p className="text-slate-300">
                  Merci pour ton message. On revient vers toi dès que possible à l'adresse <span className="text-emerald-400 font-medium">{email}</span>.
                </p>
                
                <button
                  onClick={() => {
                    setSent(false);
                    setFirstName("");
                    setEmail("");
                    setMessage("");
                    setSubject("");
                  }}
                  className="mt-6 px-4 py-2 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200"
                >
                  Envoyer un autre message
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Contact Form
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              {error && (
                <div className="mb-6 rounded-lg border border-red-500 bg-red-500/15 px-4 py-3 text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-6">
                
                {/* Type de message */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Type de message</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <SubjectButton
                      active={subject === "improvement"}
                      onClick={() => setSubject("improvement")}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      }
                      label="Amélioration"
                    />
                    <SubjectButton
                      active={subject === "bug"}
                      onClick={() => setSubject("bug")}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      }
                      label="Bug"
                    />
                    <SubjectButton
                      active={subject === "feedback"}
                      onClick={() => setSubject("feedback")}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      }
                      label="Avis"
                    />
                    <SubjectButton
                      active={subject === "question"}
                      onClick={() => setSubject("question")}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      label="Question"
                    />
                  </div>
                </div>

                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Prénom</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-lg bg-slate-800/30 border border-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-red-500/50 focus:bg-slate-800/50 transition-all duration-200"
                    placeholder="Ton prénom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-slate-800/30 border border-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-red-500/50 focus:bg-slate-800/50 transition-all duration-200"
                    placeholder="ton@email.com"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full rounded-lg bg-slate-800/30 border border-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-red-500/50 focus:bg-slate-800/50 transition-all duration-200 resize-none"
                    placeholder={getPlaceholder(subject)}
                  />
                  
                  <div className="mt-3 p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-amber-300/90">
                        {subject === "bug" 
                          ? "Astuce : indique la page, l'action effectuée, et ce qui s'affiche au lieu du résultat attendu."
                          : "Plus tu es précis, plus on pourra t'aider rapidement !"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:opacity-50"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8">
          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Questions fréquentes"
            description="Consulte notre FAQ avant d'écrire, ta réponse s'y trouve peut-être !"
            link="/faq"
          />
        </div>
      </div>
    </div>
  );
}

// Helper function for placeholder text
function getPlaceholder(subject: string): string {
  switch (subject) {
    case "bug":
      return "Décris le bug : quelle page, quelle action, et quel résultat inattendu...";
    case "improvement":
      return "Décris ton idée d'amélioration et comment elle enrichirait le jeu...";
    case "feedback":
      return "Partage ton avis sur l'expérience de jeu, ce que tu aimes ou aimerais voir...";
    case "question":
      return "Pose ta question de façon claire et précise...";
    default:
      return "Ton message...";
  }
}

// Subject Button Component
interface SubjectButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function SubjectButton({ active, onClick, icon, label }: SubjectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200
        ${active 
          ? 'bg-red-950/40 border-red-900/50 text-red-300' 
          : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-700/50 hover:text-slate-300'
        }
      `}
    >
      <div className={active ? 'text-red-400' : 'text-slate-500'}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// Info Card Component
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

function InfoCard({ icon, title, description, link }: InfoCardProps): React.JSX.Element {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="block p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 border border-slate-800/50 hover:border-slate-700/50 rounded-lg transition-all duration-200 group"
      >
        {content}
        <div className="mt-2 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Consulter</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-900/30 border border-slate-800/50 rounded-lg">
      {content}
    </div>
  );
}