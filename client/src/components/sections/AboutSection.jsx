import React, { useState, useEffect, useRef } from 'react';
import { InnovationIcon, CreativityIcon, ScalabilityIcon } from '../animated';

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleIcons, setVisibleIcons] = useState({
    innovation: false,
    creativity: false,
    scalability: false
  });
  const sectionRef = useRef(null);
  const iconsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === sectionRef.current) {
              setIsVisible(true);
            }
            if (entry.target === iconsRef.current) {
              // Stagger the icon animations
              setTimeout(() => setVisibleIcons(prev => ({ ...prev, innovation: true })), 200);
              setTimeout(() => setVisibleIcons(prev => ({ ...prev, creativity: true })), 400);
              setTimeout(() => setVisibleIcons(prev => ({ ...prev, scalability: true })), 600);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    if (iconsRef.current) {
      observer.observe(iconsRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
      if (iconsRef.current) observer.unobserve(iconsRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
      id="about"
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-shift"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10h20M10 0v20" stroke="currentColor" strokeWidth="0.5" className="text-blue-400"/>
              <circle cx="10" cy="10" r="1" fill="currentColor" className="text-blue-500"/>
              <circle cx="0" cy="10" r="0.5" fill="currentColor" className="text-purple-500"/>
              <circle cx="20" cy="10" r="0.5" fill="currentColor" className="text-purple-500"/>
              <circle cx="10" cy="0" r="0.5" fill="currentColor" className="text-purple-500"/>
              <circle cx="10" cy="20" r="0.5" fill="currentColor" className="text-purple-500"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
            isVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'
          }`}>
            About <span className="text-blue-600">VoxCyber</span>
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8 transition-all duration-700 ${
            isVisible ? 'animate-scale-in opacity-100' : 'opacity-0 scale-x-0'
          }`} style={{ animationDelay: '0.3s' }}></div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Company Description */}
          <div className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`} style={{ animationDelay: '0.5s' }}>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
              At VoxCyber, we specialize in crafting <span className="text-blue-600 font-semibold">innovative websites</span> and 
              <span className="text-purple-600 font-semibold"> cutting-edge web applications</span> that drive business growth 
              and deliver exceptional user experiences.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our team combines technical expertise with creative vision to build digital solutions that are not just 
              functional, but truly transformative. We believe in the power of technology to elevate brands and 
              connect businesses with their audiences in meaningful ways.
            </p>
          </div>

          {/* Values/Features Icons */}
          <div ref={iconsRef} className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Innovation */}
            <div className={`text-center group transition-all duration-500 ${
              visibleIcons.innovation ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'
            }`}>
              <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <InnovationIcon 
                  isVisible={visibleIcons.innovation} 
                  className="text-blue-600 group-hover:text-yellow-500 transition-colors duration-300"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Innovation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We stay ahead of the curve with the latest technologies and frameworks, ensuring your digital 
                solutions are built for the future and optimized for performance.
              </p>
            </div>

            {/* Creativity */}
            <div className={`text-center group transition-all duration-500 ${
              visibleIcons.creativity ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'
            }`} style={{ animationDelay: '0.2s' }}>
              <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <CreativityIcon 
                  isVisible={visibleIcons.creativity} 
                  className="text-purple-600 group-hover:text-pink-500 transition-colors duration-300"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Creativity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every project is a canvas for creative expression. We design unique, visually stunning interfaces 
                that capture your brand's essence and engage your users.
              </p>
            </div>

            {/* Scalability */}
            <div className={`text-center group transition-all duration-500 ${
              visibleIcons.scalability ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'
            }`} style={{ animationDelay: '0.4s' }}>
              <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
                <ScalabilityIcon 
                  isVisible={visibleIcons.scalability} 
                  className="text-green-600 group-hover:text-emerald-500 transition-colors duration-300"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                Scalability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We build solutions that grow with your business. Our scalable architectures and clean code 
                ensure your digital presence can evolve and expand seamlessly.
              </p>
            </div>
          </div>

          {/* Additional Content */}
          <div className={`text-center mt-16 transition-all duration-700 ${
            isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`} style={{ animationDelay: '1s' }}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose VoxCyber?
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Modern, responsive design principles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Performance-optimized development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">SEO and accessibility focused</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Collaborative development process</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700">Ongoing support and maintenance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Results-driven approach</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/20 rounded-full animate-float-gentle"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-full animate-float-gentle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-20 w-3 h-3 bg-green-400/20 rounded-full animate-float-gentle" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-40 right-10 w-5 h-5 bg-blue-400/20 rounded-full animate-float-gentle" style={{ animationDelay: '6s' }}></div>
    </section>
  );
};

export default AboutSection;