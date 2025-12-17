import { useState } from 'react';
import '../css/RoleCard.css';

export default function RoleCard({
  icon,
  title,
  description,
  features = [],
  buttonText,
  onClick,
  delay = 0
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`role-card ${isHovered ? 'role-card-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="role-card-glow"></div>
      <div className="role-card-content">
        <div className="role-card-icon-wrapper">
          <div className={`role-card-icon ${isHovered ? 'icon-scaled' : ''}`}>
            {icon}
          </div>
        </div>

        <h2 className="role-card-title">{title}</h2>
        <p className="role-card-description">{description}</p>

        <div className="role-card-features">
          {features.map((feature, index) => (
            <div key={index} className="role-card-feature">
              <div className="role-card-feature-dot"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button className="role-card-button">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
