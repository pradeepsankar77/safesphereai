import React from 'react';

export default function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-black">
      {/* Dotted Grid Overlay */}
      <div className="absolute inset-0 dotted-grid opacity-60" />

      {/* Soft Radial Green Glow Blobs */}
      <div 
        className="glow-blob w-[500px] h-[500px] -top-32 -left-32 bg-gradient-to-br from-[#C6FF00] to-[#00E676]" 
        aria-hidden="true" 
      />
      <div 
        className="glow-blob w-[600px] h-[600px] top-1/3 -right-48 bg-gradient-to-bl from-[#00E676] to-[#C6FF00]" 
        aria-hidden="true" 
      />
      <div 
        className="glow-blob w-[700px] h-[700px] -bottom-48 left-1/4 bg-gradient-to-tr from-[#00E676] via-[#C6FF00] to-transparent opacity-10" 
        aria-hidden="true" 
      />

      {/* Subtle 3D Swirl / Ribbon SVGs in corners */}
      <svg
        className="absolute top-0 right-0 w-96 h-96 opacity-20 transform translate-x-1/4 -translate-y-1/4"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M50 350C150 150 250 450 350 50"
          stroke="url(#limeGradientTop)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
        <path
          d="M80 370C180 170 280 470 380 70"
          stroke="url(#limeGradientTop)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <defs>
          <linearGradient id="limeGradientTop" x1="50" y1="350" x2="350" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C6FF00" />
            <stop offset="1" stopColor="#00E676" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-80 h-80 opacity-20 transform -translate-x-1/4 translate-y-1/4"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M50 50C150 250 250 -50 350 350"
          stroke="url(#limeGradientBottom)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="limeGradientBottom" x1="50" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00E676" />
            <stop offset="1" stopColor="#C6FF00" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
