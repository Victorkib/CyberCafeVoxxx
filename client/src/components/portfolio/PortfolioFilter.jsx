import React from 'react';

const PortfolioFilter = ({ 
  activeFilter, 
  onFilterChange, 
  projectCounts = {},
  className = '' 
}) => {
  const filters = [
    { id: 'all', label: 'All', count: projectCounts.all || 0 },
    { id: 'websites', label: 'Websites', count: projectCounts.websites || 0 },
    { id: 'webapps', label: 'Web Apps', count: projectCounts.webapps || 0 },
    { id: 'branding', label: 'Branding', count: projectCounts.branding || 0 }
  ];

  return (
    <div className={`portfolio-filter ${className}`}>
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              relative px-4 py-2 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base
              transition-all duration-300 transform hover:scale-105
              ${activeFilter === filter.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
              }
            `}
          >
            {/* Active indicator */}
            {activeFilter === filter.id && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 opacity-90"></div>
            )}
            
            <span className="relative z-10 flex items-center gap-2">
              {filter.label}
              {filter.count > 0 && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-bold
                  ${activeFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-600'
                  }
                `}>
                  {filter.count}
                </span>
              )}
            </span>

            {/* Hover glow effect */}
            <div className={`
              absolute inset-0 rounded-full opacity-0 transition-opacity duration-300
              ${activeFilter !== filter.id ? 'group-hover:opacity-100' : ''}
            `}>
              <div className="absolute inset-0 rounded-full shadow-lg shadow-blue-500/20"></div>
            </div>
          </button>
        ))}
      </div>

      {/* Active filter indicator line */}
      <div className="relative mt-6">
        <div className="h-px bg-gray-200 w-full"></div>
        <div 
          className="absolute top-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{
            width: '60px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default PortfolioFilter;