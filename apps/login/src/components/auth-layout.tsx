import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

// nexus auth shell: warm-dark grid background, ◈ nexus brand, centered square
// card with a crimson→amber top edge. Used by the rebuilt login pages.
export function AuthLayout({
  title,
  description,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dark ztdl-grid-bg text-foreground flex min-h-dvh w-full items-center justify-center bg-[#0e0a08] px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <span className="text-accent text-2xl leading-none">◈</span>
          <span className="text-foreground text-2xl font-extrabold tracking-tight">nexus</span>
        </div>
        <Card className="relative gap-0 rounded-none border-border bg-card py-7 shadow-none before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-primary before:to-accent before:content-['']">
          {(title || description) && (
            <div className="mb-6 px-7">
              {title && <h1 className="text-foreground text-center text-xl font-bold">{title}</h1>}
              {description && <p className="text-muted-foreground mt-1.5 text-center text-sm">{description}</p>}
            </div>
          )}
          <div className="px-7">{children}</div>
        </Card>
      </div>
    </div>
  );
}
