'use client';
import React, { createContext, useContext } from "react";
import theme from '../../styles/theme';

const ThemeContext = createContext(theme);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
