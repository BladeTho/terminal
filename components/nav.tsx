"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/gates",
    label: "Discover",
    icon: (
      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
    ),
  },
  {
    href: "/matches",
    label: "Matches",
    icon: (
      <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z" />
    ),
  },
  {
    href: "/itinerary",
    label: "Itinerary",
    icon: (
      <>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <path d="M9 3h6v4H9zM9 12h6M9 16h4" />
      </>
    ),
  },
  {
    href: "/lounge",
    label: "Lounge",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    ),
  },
  {
    href: "/profile",
    label: "My Pass",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export function Nav({ unread }: { unread: number }) {
  const path = usePathname();

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        {ITEMS.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/") || (item.href === "/gates" && path.startsWith("/passengers/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item"
              data-active={active}
              aria-current={active ? "page" : undefined}
            >
              <span style={{ position: "relative" }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
                {item.href === "/matches" && unread > 0 && (
                  <span className="nav-badge">{unread}</span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
