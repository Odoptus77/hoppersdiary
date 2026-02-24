export function SiteFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hoppersdiary — Community-Tipps für Groundhopper. (MVP)
      </div>
    </footer>
  );
}
