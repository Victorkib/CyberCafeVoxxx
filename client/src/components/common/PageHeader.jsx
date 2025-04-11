import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mt-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-500">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
};

export default PageHeader; 