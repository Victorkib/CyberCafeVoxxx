import React, { useState } from 'react';
import { AnimatedBackground } from './index';

const BackgroundDemo = () => {
  const [variant, setVariant] = useState('particles');
  const [intensity, setIntensity] = useState('medium');

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Background */}
      <AnimatedBackground variant={variant} intensity={intensity} />
      
      {/* Controls */}
      <div className="relative z-10 p-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h2 className="text-white text-xl font-bold mb-4">Background Demo</h2>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Variant
            </label>
            <select 
              value={variant} 
              onChange={(e) => setVariant(e.target.value)}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            >
              <option value="particles">Particles</option>
              <option value="waves">Gradient Waves</option>
              <option value="circuit">Circuit Pattern</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Intensity
            </label>
            <select 
              value={intensity} 
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="text-white text-sm">
            <p><strong>Current:</strong> {variant} - {intensity}</p>
          </div>
        </div>
        
        {/* Sample content to test overlay */}
        <div className="mt-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Animated Background System
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Testing all three background variants with different intensities
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover-lift hover-glow">
              Get Started
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover-lift">
              See Our Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundDemo;