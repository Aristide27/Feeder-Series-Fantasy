"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

export default function LayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMyTeam = pathname === "/my-team";

  if (isMyTeam) {
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
