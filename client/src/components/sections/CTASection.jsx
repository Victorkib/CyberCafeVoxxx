import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleContactUs = () => {
    // First try to scroll to footer contact info
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: navigate to contact page or show contact modal
      // For now, we'll scroll to the top and show an alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // In a real implementation, this could open a contact modal
      setTimeout(() => {
        alert('Contact form coming soon! Please reach out via the footer contact information.');
      }, 500);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(true);
      handleContactUs();
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  // Create ripple effect on click
  const createRipple = (event) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleMouseDown = (event) => {
    setIsPressed(true);
    createRipple(event);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  return (
    <section 
      ref={sectionRef}
      className="cta-section relative py-20 px-6 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-1/3 h-1/3 rounded-full bg-blue-400/20 blur-[60px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-2/5 h-2/5 rounded-full bg-blue-500/15 blur-[80px] animate-pulse animation-delay-1000"></div>
        
        {/* Circuit Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-300 rounded-full animate-spin-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-blue-300 rounded-full animate-spin-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-300 rounded-full animate-spin-slow animation-delay-3000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-300 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-100 text-sm font-medium mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ready to Transform Your Digital Presence?
        </div>

        {/* Main Headline */}
        <h2 
          className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          Ready to Build Your Next{' '}
          <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            Digital Solution?
          </span>
        </h2>

        {/* Subtext */}
        <p 
          className={`text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ animationDelay: '400ms' }}
        >
          Let's collaborate to create innovative websites and web applications that drive your business forward. 
          Our team is ready to bring your vision to life.
        </p>

        {/* CTA Button */}
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ animationDelay: '600ms' }}
        >
          <button
            ref={buttonRef}
            onClick={handleContactUs}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 font-semibold text-lg rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:ring-offset-2 focus:ring-offset-blue-900 overflow-hidden ${
              isPressed ? 'scale-95' : ''
            }`}
            aria-label="Contact us to start your project"
            tabIndex={0}
          >
            {/* Ripple Effects */}
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                className="absolute rounded-full bg-blue-400/30 animate-ping"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                  animationDuration: '0.6s'
                }}
              />
            ))}

            {/* Button Glow Effect */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 blur-xl ${
              isHovered ? 'opacity-30 scale-110' : 'opacity-0 scale-100'
            }`}></div>
            
            {/* Button Content */}
            <span className="relative z-10 transition-all duration-200">Contact Us</span>
            <ArrowRight 
              className={`relative z-10 w-5 h-5 transition-all duration-300 ${
                isHovered ? 'translate-x-1 scale-110' : ''
              }`} 
            />
            
            {/* Animated Border */}
            <div className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}></div>

            {/* Shine Effect */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 ${
              isHovered ? 'translate-x-full' : '-translate-x-full'
            }`} style={{ transform: `translateX(${isHovered ? '100%' : '-100%'}) skewX(-20deg)` }}></div>
          </button>
        </div>

        {/* Additional Info */}
        <div 
          className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-200 text-sm transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ animationDelay: '800ms' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Free Consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-500"></div>
            <span>Custom Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-1000"></div>
            <span>Expert Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;