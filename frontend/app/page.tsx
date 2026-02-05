import HomePage from "@/components/pages/home-page";

export default function Page() {
  return <HomePage />;
}


// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function HomePage() {
//   const router = useRouter();
//   const [teamName, setTeamName] = useState("");
//   const [fsfLeagueId, setFsfLeagueId] = useState<number | null>(null);

//   // Charger l'ID de la ligue FSF au montage
//   useEffect(() => {
//     fetch("http://localhost:3000/api/leagues")
//       .then(res => {
//         if (!res.ok) {
//           console.error("Erreur API leagues:", res.status);
//           return;
//         }
//         return res.json();
//       })
//       .then(leagues => {
//         // CORRECTION: Vérifier que leagues est un tableau
//         if (!leagues || !Array.isArray(leagues)) {
//           console.error("leagues n'est pas un tableau:", leagues);
//           return;
//         }
        
//         const fsf = leagues.find((l: any) => l.code === "FSF" || l.is_official === 1);
//         if (fsf) setFsfLeagueId(fsf.id);
//       })
//       .catch(err => {
//         console.error("Erreur chargement leagues:", err);
//       });
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
//       {/* Hero Section */}
//       <div className="max-w-2xl w-full space-y-8">
//         {/* Logo + Main Title */}
//         <div className="space-y-4 text-center">
//           {/* Logo */}
//           <div className="flex justify-center mb-8">
//             <img 
//               src="/logo/logo.png" 
//               alt="Feeder Series Fantasy" 
//               className="h-40 w-auto drop-shadow-2xl"
//             />
//           </div>
          
//           {/* Titre */}
//           <h1 className="text-6xl md:text-7xl font-bold text-balance leading-tight">
//             Feeder Series <span className="text-accent">F2</span>
//           </h1>
          
//           <p className="text-2xl text-foreground font-medium text-balance">
//             Construis ton équipe ultime de Formule 2
//           </p>
//         </div>

//         {/* Central Box - Conversion Focused */}
//         <div className="bg-card border-2 border-accent/30 rounded-xl p-8 md:p-10 space-y-6">
//           {/* Box Title */}
//           <div className="text-center">
//             <h2 className="text-2xl md:text-3xl font-bold text-foreground">
//               Ton équipe ultime à portée de main
//             </h2>
//           </div>

//           {/* CTA Button */}
//           {fsfLeagueId ? (
//             <Link
//               href={`/my-team?leagueId=${fsfLeagueId}`}
//               className="block w-full px-6 py-4 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/90 transition-all active:scale-95 text-lg text-center"
//             >
//               Créer mon équipe
//             </Link>
//           ) : (
//             <button
//               disabled
//               className="w-full px-6 py-4 bg-accent/50 text-accent-foreground font-bold rounded-lg opacity-50 cursor-wait text-lg"
//             >
//               Chargement...
//             </button>
//           )}
//         </div>

//         {/* Competitive / Immersive Tagline */}
//         <div className="text-center space-y-2">
//           <p className="text-lg text-foreground font-semibold">
//             Le jeu fantasy F2 le plus immersif & compétitif
//           </p>
//           <p className="text-sm text-muted-foreground">
//             Construis, rivalise, domine les classements mondiaux
//           </p>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-3 gap-4 pt-6">
//           <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center space-y-1">
//             <div className="text-2xl font-bold text-accent">50+</div>
//             <p className="text-xs text-muted-foreground">Pilotes F2</p>
//           </div>
//           <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center space-y-1">
//             <div className="text-2xl font-bold text-accent">∞</div>
//             <p className="text-xs text-muted-foreground">Ligues</p>
//           </div>
//           <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center space-y-1">
//             <div className="text-2xl font-bold text-accent">24/7</div>
//             <p className="text-xs text-muted-foreground">En ligne</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }