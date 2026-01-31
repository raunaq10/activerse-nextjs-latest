'use client';

interface GameCardProps {
  image: string;
  alt: string;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  iconShadow: string;
  titleColor: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  iconPosition?: 'left' | 'right';
}

export default function GameCard({
  image,
  alt,
  title,
  description,
  gradient,
  iconBg,
  iconColor,
  iconShadow,
  titleColor,
  badgeText,
  badgeBg,
  badgeColor,
  iconPosition = 'left',
}: GameCardProps) {
  return (
    <div className="game-card">
      <div className={`game-image ${gradient}`}>
        <img
          src={image}
          alt={alt}
          className="object-cover w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div
          className={`game-icon absolute bottom-5 ${iconPosition === 'left' ? 'left-5' : 'right-5'} w-12 h-12 rounded-full ${iconBg} border-2 ${iconBg} flex items-center justify-center text-3xl ${iconColor} font-bold ${iconShadow}`}
        >
          🎮
        </div>
        <span className={`game-badge ${badgeBg} ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <div className="game-info">
        <h3 className={titleColor}>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
