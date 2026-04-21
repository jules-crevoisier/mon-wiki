"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  href?: string;
  action?: () => void;
}

const NAV_ITEMS: Omit<CommandItem, "id">[] = [
  { label: "Accueil", hint: "Aller a la page d'accueil", href: "/" },
  { label: "Guide Frontend", hint: "Ouvrir le sujet", href: "/sujet/guide-frontend" },
  { label: "Runbook Infra", hint: "Ouvrir le sujet", href: "/sujet/runbook-infra" },
  { label: "API Dev", hint: "Ouvrir le sujet", href: "/sujet/api-dev" },
  { label: "Design System", hint: "Page du sujet Guide Frontend", href: "/sujet/guide-frontend/design-system" },
  { label: "Composants", hint: "Page du sujet Guide Frontend", href: "/sujet/guide-frontend/composants" },
  { label: "Monitoring", hint: "Page du sujet Runbook Infra", href: "/sujet/runbook-infra/monitoring" },
  { label: "Alerting", hint: "Page du sujet Runbook Infra", href: "/sujet/runbook-infra/alerting" },
];

export function CommandK() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onOpenCommandPalette = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wiki:open-command-k", onOpenCommandPalette);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wiki:open-command-k", onOpenCommandPalette);
    };
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const actions: Omit<CommandItem, "id">[] = [
      {
        label: "Nouveau sujet",
        hint: "Action rapide",
        action: () => {
          window.alert("Action demo: creation de sujet");
        },
      },
      {
        label: "Nouvelle page",
        hint: "Action rapide",
        action: () => {
          window.alert("Action demo: creation de page");
        },
      },
    ];

    return [...NAV_ITEMS, ...actions].map((item, index) => ({ ...item, id: `${index}-${item.label}` }));
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.hint.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    setQuery("");
    if (item.href) {
      router.push(item.href);
      return;
    }
    item.action?.();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % filteredItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + filteredItems.length) % filteredItems.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-2xl rounded-xl border bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Rechercher une page, un sujet, une action..."
            className="w-full bg-transparent text-sm outline-none"
          />
          <span className="rounded border px-2 py-0.5 text-xs text-muted-foreground">Esc</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted ${
                filteredItems[selectedIndex]?.id === item.id ? "bg-muted" : ""
              }`}
              onMouseEnter={() => {
                const nextIndex = filteredItems.findIndex((candidate) => candidate.id === item.id);
                if (nextIndex >= 0) setSelectedIndex(nextIndex);
              }}
              onClick={() => handleSelect(item)}
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.hint}</span>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">Aucun resultat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
