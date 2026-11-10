"use client";

import { LayoutGrid, LayoutPanelLeft } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { type Layout, useViewStore } from "@/stores/use-view-store";

const OPTIONS = [
  {
    value: "grid",
    label: "Grid",
    icon: <LayoutGrid />,
    title: "Grid: all four the same size (G)",
  },
  {
    value: "focus",
    label: "Focus",
    icon: <LayoutPanelLeft />,
    title: "Focus: one camera large (1–4 picks which)",
  },
] as const;

/** Grid ↔ focus. */
export function LayoutSwitch({ className }: { className?: string }) {
  const layout = useViewStore((s) => s.layout);
  const setLayout = useViewStore((s) => s.setLayout);

  return (
    <Segmented<Layout>
      value={layout}
      options={OPTIONS}
      onChange={setLayout}
      label="Layout"
      className={className}
    />
  );
}
