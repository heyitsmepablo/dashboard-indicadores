// src/hooks/use-columns.ts
import { useState, useEffect } from "react";

export function useColumns() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumns(4); // xl
      } else if (width >= 1024) {
        setColumns(3); // lg
      } else if (width >= 640) {
        setColumns(2); // sm
      } else {
        setColumns(1); // mobile
      }
    }

    // Inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}
