import React from 'react';

import './loader-circle.scss';

interface LoaderCircleProps {
  text?: string;
}

export default function LoaderCircle({ text = 'Generating...' }: LoaderCircleProps) {
  return (
    <div className="loader" id="loader">
      <div className="loader-wrapper">
        {text.split('').map((char, index) => (
          <span key={index} className="loader-letter">
            {char}
          </span>
        ))}
        <div className="loader-circle"></div>
        <div className="loader-circle-bg1"></div>
        <div className="loader-circle-bg2"></div>
      </div>
    </div>
  );
}
