import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/afia-logo.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Afia Clinic" className="h-10 w-auto object-contain" />
          <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:inline">
            Afia Clinic
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/book" className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md">
            Book Appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}