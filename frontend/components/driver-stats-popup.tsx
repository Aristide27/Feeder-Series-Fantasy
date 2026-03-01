"use client";

import { useEffect, useState } from "react";
import { X, Activity } from "lucide-react";
import { getToken } from "@/lib/auth/token";

type Weekend = {
  weekend_id: number | null;
  season: number | null;
  round: number | null;
  weekend_name: string;
  quali_position: number | null;
  sprint_position: number | null;
  feature_position: number | null;
  quali_points: number;
  sprint_points: number;
  feature_points: number;
  total_points: number;
};

type DriverStats = {
  driver: {
    driver_id: number;
    season: number;
    rookie: number;
    driver_price: number;
    driver_name: string;
    driver_nationality: string;
    driver_number: number | null;
    constructor_id: number;
    constructor_name: string;
  };
  hasData: boolean;
  message?: string;
  normalized?: {
    avg_quali: number;
    avg_sprint: number;
    avg_feature: number;
    points_per_million: number;
    best_weekend: number;
  };
  raw?: {
    avg_quali: number | null;
    avg_sprint: number | null;
    avg_feature: number | null;
    points_per_million: number;
    best_weekend: number;
    total_points: number;
    races_count: number;
  };
  last_weekends?: Weekend[];
};

type Props = {
  driverId: number;
  onClose: () => void;
};

export default function DriverStatsPopup({ driverId, onClose }: Props) {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Non authentifié");
      setLoading(false);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    fetch(`${API_URL}/api/driver-stats/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [driverId]);

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-slate-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <span>Chargement des statistiques...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-red-900/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-red-400">Erreur</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-slate-300">{error || "Données introuvables"}</p>
        </div>
      </div>
    );
  }

  const { driver, normalized, raw, last_weekends } = stats;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-4xl w-full border border-slate-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4 min-w-0 w-full">
            <div className="flex items-center justify-between gap-4 min-w-0 w-full">
              <h2 className="text-2xl font-bold text-white truncate min-w-0">
                {driver.driver_name}
              </h2>

              <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
                {driver.driver_number && (
                  <span className="text-2xl font-black text-white">
                    #{driver.driver_number}
                  </span>
                )}
                <span className="text-slate-400 text-base">
                  {driver.constructor_name}
                </span>
                <span className="text-green-400 text-base font-bold">
                  ${driver.driver_price}M
                </span>
                {driver.rookie === 1 && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold rounded uppercase">
                    Rookie
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="flex justify-center">
                <RadarChart data={normalized!} />
              </div>

              <div className="w-full">
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-5 space-y-6">
                  <div>
                    <div className="text-slate-400 text-m font-bold mb-3 text-center">
                      Moyennes saison 2026
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Qualif</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.avg_quali ? `P${raw!.avg_quali.toFixed(1)}` : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Sprint</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.avg_sprint ? `P${raw!.avg_sprint.toFixed(1)}` : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Feature</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.avg_feature ? `P${raw!.avg_feature.toFixed(1)}` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-m font-bold mb-3 text-center">
                      Performance saison 2026
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Points/M</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.points_per_million.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Meilleur WE</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.best_weekend} pts
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Total</div>
                        <div className="text-white text-lg font-bold">
                          {raw!.total_points} pts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-center pt-3">
                  Basé sur {raw!.races_count} course{raw!.races_count > 1 ? "s" : ""} disputée
                  {raw!.races_count > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {last_weekends && last_weekends.length > 0 && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                5 derniers weekends
              </h3>
              <Last5WeekendsTable weekends={last_weekends} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: NonNullable<DriverStats["normalized"]> }) {
  const labels = ["Moy Q", "Moy SR", "Moy FR", "Points/M", "Best WE"];
  const values = [
    data.avg_quali,
    data.avg_sprint,
    data.avg_feature,
    data.points_per_million,
    data.best_weekend,
  ];

  const size = 280;
  const center = size / 2;
  const radius = size / 1.7 - 50;
  const numSides = 5;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numSides - Math.PI / 2;
    const distance = radius * value;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const outerPoints = Array.from({ length: numSides }, (_, i) => getPoint(i, 1));
  const dataPoints = values.map((value, i) => getPoint(i, value));
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {gridLevels.map((level, i) => {
          const points = Array.from({ length: numSides }, (_, idx) => getPoint(idx, level));
          return (
            <polygon
              key={i}
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {outerPoints.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#475569"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="2"
        />

        {dataPoints.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="4" fill="#3b82f6" />
        ))}

        {outerPoints.map((point, i) => {
          const labelAngle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
          const labelDistance = radius + 35;
          const labelX = center + labelDistance * Math.cos(labelAngle);
          const labelY = center + labelDistance * Math.sin(labelAngle);

          return (
            <text
              key={i}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-300 text-xs font-medium"
            >
              {labels[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Last5WeekendsTable({ weekends }: { weekends: Weekend[] }) {
  const cols = [...weekends].slice(0, 5).reverse();

  const cell = (pos: number | null, isNA: boolean) => {
    if (isNA) return "—";
    if (pos === null || pos === 0) return "—";
    return String(pos);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-2 items-center">
        <div />
        {cols.map((w, i) => {
          const isNA = w.weekend_id === null;
          const label = isNA ? "—" : shortWeekendName(w.weekend_name);
          return (
            <div
              key={i}
              className="text-center text-sm font-semibold text-slate-200 truncate"
              title={isNA ? "" : w.weekend_name}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-2 items-center">
        <div className="text-slate-300 font-bold text-center">Q</div>
        {cols.map((w, i) => {
          const isNA = w.weekend_id === null;
          return (
            <div key={i} className="text-center text-slate-100">
              {cell(w.quali_position, isNA)}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-2 items-center">
        <div className="text-slate-300 font-bold text-center">SR</div>
        {cols.map((w, i) => {
          const isNA = w.weekend_id === null;
          return (
            <div key={i} className="text-center text-slate-100">
              {cell(w.sprint_position, isNA)}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-2 items-center">
        <div className="text-slate-300 font-bold text-center">FR</div>
        {cols.map((w, i) => {
          const isNA = w.weekend_id === null;
          return (
            <div key={i} className="text-center text-slate-100">
              {cell(w.feature_position, isNA)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function shortWeekendName(name: string): string {
  switch (name) {
    case "Australian Grand Prix":
      return "Australia";
    case "Bahrain Grand Prix":
      return "Bahrain";
    case "Saudi Arabian Grand Prix":
      return "Saudi Arabia";
    case "Gran premio del made in Italy e dell'Emilia-Romagnia":
      return "Italy";
    case "Grand Prix de Monaco":
      return "Monaco";
    case "Gran premio de España":
      return "Spain";
    case "Gran premio de Barcelona-Catalunya":
      return "Spain";
    case "Austrian Grand Prix":
      return "Austria";
    case "British Grand Prix":
      return "Great Britain";
    case "Belgian Grand Prix":
      return "Belgium";
    case "Hungarian Grand Prix":
      return "Hungary";
    case "Azerbaijan Grand Prix":
      return "Azerbaijan";
    case "Qatar Grand Prix":
      return "Qatar";
    case "Abu Dhabi Grand Prix":
      return "Abu Dhabi";
    case "Gran premio d'Italia":
      return "Italy";
    default:
      return name;
  }
}