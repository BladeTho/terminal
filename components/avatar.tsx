/**
 * Generative portrait. We never use stock photos of people — least of all on
 * an app where the profiles describe real illness. A drawn silhouette is
 * honest about being a placeholder and still reads as a person.
 */
export function Avatar({
  seed,
  name,
  size = 64,
}: {
  seed: number;
  name: string;
  size?: number;
}) {
  const hue = (seed * 47) % 360;
  const hair = seed % 5;
  const glasses = seed % 3 === 0;
  const id = `av${seed}`;

  return (
    <svg
      className="avatar"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Illustrated portrait of ${name}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 34% 30%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 30% 17%)`} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill={`url(#${id})`} />
        {/* shoulders */}
        <ellipse cx="50" cy="103" rx="36" ry="30" fill={`hsl(${hue} 22% 62%)`} />
        {/* neck */}
        <rect x="42" y="60" width="16" height="18" rx="7" fill={`hsl(${hue} 20% 55%)`} />
        {/* head */}
        <ellipse cx="50" cy="45" rx="21" ry="24" fill={`hsl(${hue} 22% 68%)`} />
        {/* hair variations — grey, because everyone here has earned it */}
        {hair === 0 && <path d="M28 42a22 22 0 0 1 44 0c0-16-9-24-22-24S28 26 28 42Z" fill="#d8d3c8" />}
        {hair === 1 && <path d="M28 44c-2-18 8-28 22-28s24 10 22 28c-3-6-4-14-10-16-8 6-20 5-26-2-4 3-6 11-8 18Z" fill="#c9c3b6" />}
        {hair === 2 && <path d="M31 36c4-12 34-12 38 0 2 6 1 10-1 12-1-9-8-12-18-12s-16 3-18 12c-2-2-3-6-1-12Z" fill="#b9b3a6" />}
        {hair === 3 && <ellipse cx="50" cy="27" rx="23" ry="11" fill="#e2ded4" />}
        {hair === 4 && <path d="M29 40c0-14 9-22 21-22s21 8 21 22c-4-4-6-10-9-11-6 5-18 6-24 1-3 2-6 6-9 10Z" fill="#a8a294" />}
        {/* eyes */}
        <circle cx="42" cy="46" r="2.1" fill="#2a2620" />
        <circle cx="58" cy="46" r="2.1" fill="#2a2620" />
        {glasses && (
          <g stroke="#2a2620" strokeWidth="1.6" fill="none" opacity=".8">
            <circle cx="42" cy="46" r="7" />
            <circle cx="58" cy="46" r="7" />
            <path d="M49 46h2" />
          </g>
        )}
        {/* mouth — a small, closed, content line */}
        <path d="M44 57q6 4 12 0" stroke="#2a2620" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
