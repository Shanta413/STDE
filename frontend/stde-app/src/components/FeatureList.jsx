import '../css/FeatureList.css';

export default function FeatureList({ features = [], variant = 'light' }) {
  return (
    <div className={`feature-list feature-list-${variant}`}>
      {features.map((feature, index) => (
        <div key={index} className="feature-item">
          <div className="feature-checkmark">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                d="M13.5 4L6 11.5L2.5 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="feature-text">{feature}</span>
        </div>
      ))}
    </div>
  );
}
