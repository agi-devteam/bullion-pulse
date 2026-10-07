import type { NavItemId } from "@/domain/navigation";

const iconProps = {
  "aria-hidden": true as const,
  fill: "none",
  height: 22,
  width: 22,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
  viewBox: "0 0 24 24",
};

export function BrandPulse() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={20}
      width={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

export function NavigationToggleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={20}
      width={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="3" width="18" x="3" y="4" />
      <path d="M9 4v16" />
    </svg>
  );
}

export function NavigationIcon({ name }: { name: NavItemId }) {
  switch (name) {
    case "home":
      return (
        <svg {...iconProps}>
          <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" />
        </svg>
      );
    case "inventory":
      return (
        <svg {...iconProps}>
          <path d="M12 3l9 5-9 5-9-5z" />
          <path d="M3 12.5l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      );
    case "pricing":
      return (
        <svg {...iconProps}>
          <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" />
          <circle cx="7.5" cy="7.5" r="1" />
        </svg>
      );
    case "suppliers":
      return (
        <svg {...iconProps}>
          <rect height="18" rx="1" width="12" x="4" y="3" />
          <path d="M16 9h4v12h-4M8 7h4M8 11h4M8 15h4" />
        </svg>
      );
    case "actions":
      return (
        <svg {...iconProps}>
          <path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10 20a2 2 0 004 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...iconProps}>
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
      );
    default:
      return null;
  }
}
