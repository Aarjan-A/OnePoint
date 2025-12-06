interface ModernLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export default function ModernLogo({ size = 64, animated = false, className = '' }: ModernLogoProps) {
  return (
    <div
      className={`${animated ? 'animate-in zoom-in duration-700' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M50 20 L70 40 L70 60 L50 80 L30 60 L30 40 Z"
          fill="url(#blueGradient)"
          opacity="0.9"
        />

        <circle
          cx="50"
          cy="50"
          r="8"
          fill="#FFFFFF"
        />

        <line x1="50" y1="50" x2="50" y2="20" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
        <line x1="50" y1="50" x2="70" y2="40" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
        <line x1="50" y1="50" x2="70" y2="60" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />

        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#0099FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
