export function SiteFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">
        © {new Date().getFullYear()} Hoppersdiary — Community-Tipps für Groundhopper. (MVP)
      </div>
    </footer>
  );
}
