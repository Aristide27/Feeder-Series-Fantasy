import Image from "next/image";

export function DriverAvatar({ index, name }: { index: number; name: string }) {
  // index 0..4
  const safe = ((index % 5) + 5) % 5;
  const src = `/avatars/drivers/driver-${safe + 1}.png`;

  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <Image src={src} alt={name} fill className="object-contain p-1" />
    </div>
  );
}
