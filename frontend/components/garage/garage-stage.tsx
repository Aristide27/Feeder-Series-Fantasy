"use client";

import Image from "next/image";

type Props = {
  backgroundSrc?: string;
  carRightSlug?: string;
  carLeftSlug?: string;
  className?: string;
  carsScale?: "md" | "lg" | "xl";
  carsLift?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
};

export default function GarageStage({
  backgroundSrc = "/garage/background.png",
  carRightSlug = "invicta",
  carLeftSlug,
  className = "",
  carsScale = "md",
  carsLift = "none",
  children,
}: Props) {
  const leftSlug = carLeftSlug ?? carRightSlug;

  const rightSrc = `/cars/${carRightSlug}/right.png`;
  const leftSrc = `/cars/${leftSlug}/right.png`;

  // taille voitures
  const carWidth =
    carsScale === "xl" ? "w-[52%]" : carsScale === "lg" ? "w-[44%]" : "w-[38%]";

  // hauteur voitures (plus haut = bottom plus grand)
  const bottom =
    carsLift === "lg" ? "bottom-[32%]" :
    carsLift === "md" ? "bottom-[15%]" :
    carsLift === "sm" ? "bottom-[11%]"  :
    "bottom-[7%]";

  return (
    <div className={`relative w-full ${className} overflow-hidden rounded-2xl border border-white/10 bg-black/40`}>
      <div className="relative w-full h-full min-h-[520px]">
        {/* Background */}
        <Image
          src={backgroundSrc}
          alt="Garage background"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Cars */}
        <div className="absolute inset-0">
          {/* Left car (mirrored) */}
          <div className={`absolute ${bottom} left-[-2%] ${carWidth}`}>
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={leftSrc}
                alt="Left car"
                fill
                className="object-contain transform -scale-x-100 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>

          {/* Right car */}
          <div className={`absolute ${bottom} right-[-2%] ${carWidth}`}>
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={rightSrc}
                alt="Right car"
                fill
                className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>

          {/* Overlay content (driver slots, HUD, etc.) */}
          <div className="absolute inset-0 z-30">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
