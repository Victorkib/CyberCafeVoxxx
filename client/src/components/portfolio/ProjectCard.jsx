import React, { useState, useRef, useEffect } from 'react';

const ProjectCard = ({ 
  project, 
  className = '',
  onImageLoad,
  onImageError 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad?.(project.id);
  };

  const handleImageError = () => {
    setImageError(true);
    onImageError?.(project.id);
  };

  const fallbackImage = '/client/public/vocCyberLogo.png';

  return (
    <div 
      ref={cardRef}
      className={`project-card group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {isVisible && (
          <>
            {/* Loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            
            {/* Project Image */}
            <img
              src={imageError ? fallbackImage : project.image}
              alt={project.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {project.technologies.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-500/80 rounded-full backdrop-blur-sm"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-500/80 rounded-full backdrop-blur-sm">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* View Project Button */}
            {project.link && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.link, '_blank', 'noopener,noreferrer');
                }}
                className="px-3 py-1 text-sm bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors duration-200 border border-white/30"
              >
                View Project →
              </button>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
            project.category === 'websites' 
              ? 'bg-blue-500/80 text-white' 
              : project.category === 'webapps'
              ? 'bg-purple-500/80 text-white'
              : project.category === 'branding'
              ? 'bg-green-500/80 text-white'
              : 'bg-gray-500/80 text-white'
          }`}>
            {project.category === 'websites' ? 'Website' : 
             project.category === 'webapps' ? 'Web App' :
             project.category === 'branding' ? 'Branding' : 'Project'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {project.title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Project Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {project.completedDate && (
            <span>
              {new Date(project.completedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
              })}
            </span>
          )}
          
          {project.featured && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl shadow-lg shadow-blue-500/20"></div>
      </div>
    </div>
  );
};

export default ProjectCard;