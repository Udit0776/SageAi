"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";

export default function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { id: "dark", label: "Sage Dark" },
    { id: "light", label: "Classic Light" },
    { id: "bumblebee", label: "Bumblebee" },
    { id: "cupcake", label: "Cupcake" },
    { id: "emerald", label: "Emerald" },
    { id: "synthwave", label: "Synthwave" },
    { id: "retro", label: "Retro" }
  ];

  if (!mounted) {
    return (
      <div className="btn btn-ghost btn-sm">
        <Paintbrush className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm text-foreground hover:bg-base-200">
        <Paintbrush className="w-4 h-4 md:mr-1" />
        <span className="hidden md:inline text-xs font-semibold">Theme</span>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-44 p-2 shadow-2xl border border-base-200 mt-2">
        <div className="px-3 py-2 text-xs font-extrabold text-base-content/50 uppercase tracking-widest mb-1">
          Select Theme
        </div>
        {themes.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => setTheme(t.id)}
              className={`text-sm py-2 px-3 rounded-md transition-all ${
                theme === t.id
                  ? "bg-primary text-primary-content font-bold shadow-md"
                  : "hover:bg-base-200 text-base-content"
              }`}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
