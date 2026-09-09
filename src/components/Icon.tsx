export type IconName =
  | "printer"
  | "bag"
  | "building"
  | "briefcase"
  | "health"
  | "wrench"
  | "megaphone"
  | "shield"
  | "layers"
  | "message"
  | "user-check"
  | "phone"
  | "clock"
  | "headset"
  | "clipboard";

const paths: Record<IconName, string> = {
  printer:
    "M6 9V3h12v6 M4 9h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3 M7 17h-3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1 M7 14h10v7H7z",
  bag: "M5 8h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8z M9 8V6a3 3 0 0 1 6 0v2",
  building:
    "M4 21h8V10H4v11z M12 21h8V4h-8v17z M7 13h2 M7 17h2 M15 7h2 M15 11h2 M15 15h2",
  briefcase:
    "M3 8h18v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19V8z M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M3 13h18",
  health: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8v8 M8 12h8",
  wrench:
    "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z",
  megaphone:
    "M3 11v2a1 1 0 0 0 1 1h2l6 4V6l-6 4H4a1 1 0 0 0-1 1z M16 9a4 4 0 0 1 0 6 M19 7a7 7 0 0 1 0 10",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  layers: "M12 3 3 8l9 5 9-5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
  message: "M4 5h16v10H8l-4 4V5z",
  "user-check":
    "M9 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M3 21v-1a6 6 0 0 1 6-6 6 6 0 0 1 5.2 3 M15 13l2 2 4-4",
  phone:
    "M6 3h4l1 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 1v4a2 2 0 0 1-2 2C10.5 20 4 13.5 4 5a2 2 0 0 1 2-2z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l4 2",
  headset:
    "M4 13v-1a8 8 0 0 1 16 0v1 M3 13h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3v-6z M21 13h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v-6z M19 19v1a3 3 0 0 1-3 3h-3",
  clipboard:
    "M6.5 4h11a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-15A1.5 1.5 0 0 1 6.5 4z M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z M8 11h8 M8 15h8 M8 19h5"
};

export default function Icon({
  name,
  size = 22,
  className
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name].split(" M").map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
}
