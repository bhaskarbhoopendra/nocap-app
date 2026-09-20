import React, { createContext, useContext, useEffect, useState } from "react";
import { getActiveTheme } from "@/services/themeService";
import { ThemeTokens } from "@/types/database";

const ThemeContext = createContext<{ theme: ThemeTokens | null; loading: boolean }>({
  theme: null,
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens = await getActiveTheme();
      setTheme(tokens);
      setLoading(false);
    })();
  }, []);

  return <ThemeContext.Provider value={{ theme, loading }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
