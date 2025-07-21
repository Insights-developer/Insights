'use client';
import React from "react";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";

type CardProps = React.PropsWithChildren<{
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>;

export default function Card({ title, icon, children, onClick, className }: CardProps) {
  const theme = useTheme();
  return (
    <div
      className={clsx(
        "card",
        className
      )}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radii.card,
        boxShadow: theme.shadow.card,
        padding: "1.5rem",
        transition: "box-shadow 0.2s",
        cursor: onClick ? "pointer" : undefined,
      }}
      onClick={onClick}
    >
      {(title || icon) && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          {icon && <div style={{ marginRight: "0.75rem" }}>{icon}</div>}
          {title && <h3 style={{
            fontFamily: theme.font.heading,
            fontWeight: 700,
            fontSize: 20,
            margin: 0
          }}>{title}</h3>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
