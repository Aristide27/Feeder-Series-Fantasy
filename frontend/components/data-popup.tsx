'use client'

interface Player {
  id: number
  name: string
  number: number
  team: string
  country: string
  rookie: boolean
}

interface DataPopupProps {
  player: Player
  onClose: () => void
}

const sampleWeekends = [
  {
    id: 1,
    round: 'Round 1 - Barcelona',
    country: '🇪🇸',
    qualifying: 3,
    sprint: 2,
    feature: 1,
  },
  {
    id: 2,
    round: 'Round 2 - Monaco',
    country: '🇲🇨',
    qualifying: 5,
    sprint: 4,
    feature: 3,
  },
  {
    id: 3,
    round: 'Round 3 - Silverstone',
    country: '🇬🇧',
    qualifying: 2,
    sprint: 1,
    feature: 2,
  },
  {
    id: 4,
    round: 'Round 4 - Spa',
    country: '🇧🇪',
    qualifying: 8,
    sprint: 6,
    feature: 5,
  },
  {
    id: 5,
    round: 'Round 5 - Monza',
    country: '🇮🇹',
    qualifying: 1,
    sprint: 3,
    feature: 4,
  },
]

export default function DataPopup({ player, onClose }: DataPopupProps) {
  const isRookie = player.rookie

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed left-8 top-32 bottom-8 w-96 bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-accent/10 border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{player.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{player.team}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Player number and country */}
          <div className="flex gap-3 mt-4">
            <span className="px-3 py-1 bg-primary/20 text-accent rounded text-sm font-bold">
              #{player.number}
            </span>
            <span className="px-3 py-1 bg-primary/20 text-accent rounded text-sm">
              {player.country}
            </span>
            {player.rookie && (
              <span className="px-3 py-1 bg-destructive/20 text-destructive rounded text-sm">
                Rookie
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isRookie ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Pas de données disponibles
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Ce pilote n'a pas encore participé à des courses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm">
                Résultats des 5 derniers weekends
              </h4>

              <div className="space-y-3">
                {sampleWeekends.map((weekend) => (
                  <div
                    key={weekend.id}
                    className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2"
                  >
                    {/* Round name with country flag */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{weekend.country}</span>
                      <h5 className="font-bold text-foreground text-sm">{weekend.round}</h5>
                    </div>

                    {/* Results grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-primary/10 rounded p-2">
                        <p className="text-muted-foreground text-xs">Qualif</p>
                        <p className="text-accent font-bold">P{weekend.qualifying}</p>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <p className="text-muted-foreground text-xs">Sprint</p>
                        <p className="text-accent font-bold">P{weekend.sprint}</p>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <p className="text-muted-foreground text-xs">Feature</p>
                        <p className="text-accent font-bold">P{weekend.feature}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
