import React from "react";
import Image from "next/image";

export type DriverLite = {
  id: number;
  name: string;
  teamName?: string;
  price?: number;
};

type DriverSlotCardProps = {
  driver?: DriverLite;
  label: string;
  avatarIndex: number;
  onClick?: () => void;
  isCaptain?: boolean;
  onToggleCaptain?: () => void;
  canEdit?: boolean;
  showBadge?: boolean;
};

export default function DriverSlotCard({ 
  driver, 
  label, 
  avatarIndex, 
  onClick,
  isCaptain = false,
  onToggleCaptain,
  canEdit = true,
  showBadge = true
}: DriverSlotCardProps) {
  const filled = Boolean(driver);
  const safe = ((avatarIndex % 5) + 5) % 5;
  const avatarSrc = `/drivers/driver-${safe + 1}.png`;

  // Style "invisible button": clickable sans carte/bulle
  const Wrapper: any = onClick && filled ? "button" : "div";

  return (
    <Wrapper
      type={Wrapper === "button" ? "button" : undefined}
      onClick={Wrapper === "button" ? onClick : undefined}
      className={[
        "w-full select-none relative",
        Wrapper === "button" ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
      aria-label={filled ? driver!.name : label}
    >
      {filled ? (
        <div className="flex flex-col items-center">
        {/* Badge Capitaine - en haut à droite */}
        {onToggleCaptain && showBadge && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (canEdit) onToggleCaptain();
            }}
            disabled={!canEdit}
            className={[
              "absolute top-0 right-[8%] z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all",
              isCaptain
                ? "bg-white border-white text-slate-900 shadow-lg"
                : "bg-white/20 border-white/30 text-white/50 hover:bg-white/30 hover:border-white/40",
              !canEdit && "opacity-50 cursor-not-allowed",
            ].join(" ")}
            title={isCaptain ? "Capitaine (2x points)" : "Définir comme capitaine"}
          >
            C
          </button>
        )}

          {/* PNG pilote SANS fond */}
          <div className="relative w-full">
            <div className="mx-auto w-[92%]">
              <div className="relative aspect-[4/5]">
                <Image
                  src={avatarSrc}
                  alt={driver!.name}
                  fill
                  priority={false}
                  className="object-contain object-top drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>
          </div>

          {/* Infos en dessous */}
          <div className="-mt-7 w-full text-center">
            <div className="text-sm font-semibold text-white/95 truncate">
              {driver!.name}
            </div>
            <div className="mt-0.5 text-[11px] text-white/65 truncate">
              {driver!.teamName ?? "—"}
            </div>
            {typeof driver!.price === "number" ? (
              <div className="mt-0.5 text-xs text-white/85">
                {driver!.price.toFixed(1).replace(".", ",")} M
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        // Slot vide (optionnel : tu peux même le rendre invisible)
        <div className="flex flex-col items-center opacity-40">
          <div className="relative aspect-[4/5] w-[92%]" />
          <div className="mt-2 text-center text-xs text-white/40">{label}</div>
        </div>
      )}
    </Wrapper>
  );
}