export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50,8 L18,27 L18,63 L50,82 L50,58 L30,46.5 L50,35 Z" fill="#873a1c" />
      <path d="M50,8 L82,27 L82,63 L50,82 L50,58 L70,46.5 L50,35 Z" fill="#c15b2b" />
    </svg>
  );
}
