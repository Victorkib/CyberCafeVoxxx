import React, { useState, useEffect } from 'react';
import { ProjectCard, PortfolioFilter, PortfolioCarousel } from '../portfolio';
import { portfolioProjects, getProjectsByCategory, getProjectCounts } from '../../data/portfolio';

const PortfolioSection = ({ className = '' }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState(portfolioProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [projectCounts, setProjectCounts] = useState({});

  // Initialize project counts
  useEffect(() => {
    setProjectCounts(getProjectCounts());
  }, []);

  // Handle filter changes with smooth transition
  useEffect(() => {
    setIsLoading(true);
    
    // Add a small delay for smooth transition effect
    const timer = setTimeout(() => {
      const projects = getProjectsByCategory(activeFilter);
      setFilteredProjects(projects);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
    }
  };

  const handleImageLoad = (projectId) => {
    console.log(`Image loaded for project: ${projectId}`);
  };

  const handleImageError = (projectId) => {
    console.warn(`Failed to load image for project: ${projectId}`);
  };

  return (
    <section className={`portfolio-section py-16 lg:py-24 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Our
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Portfolio
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our latest projects and see how we've helped businesses transform their digital presence 
            with innovative websites, web applications, and branding solutions.
          </p>
        </div>

        {/* Portfolio Filter */}
        <div className="mb-12">
          <PortfolioFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            projectCounts={projectCounts}
            className="animate-fade-in"
          />
        </div>

        {/* Portfolio Grid/Carousel */}
        <div className="relative">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">Loading projects...</span>
              </div>
            </div>
          )}

          {/* Projects Display */}
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {filteredProjects.length > 0 ? (
              <>
                {/* Desktop Grid View */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, index) => (
                      <div
                        key={project.id}
                        className="animate-fade-in"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <ProjectCard
                          project={project}
                          onImageLoad={handleImageLoad}
                          onImageError={handleImageError}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile/Tablet Carousel View */}
                <div className="lg:hidden">
                  <PortfolioCarousel
                    itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
                    showDots={true}
                    showArrows={true}
                    autoPlay={false}
                  >
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onImageLoad={handleImageLoad}
                        onImageError={handleImageError}
                      />
                    ))}
                  </PortfolioCarousel>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600">
                  No projects match the selected filter. Try selecting a different category.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Let's discuss how we can bring your vision to life with our expertise in web development and design.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;