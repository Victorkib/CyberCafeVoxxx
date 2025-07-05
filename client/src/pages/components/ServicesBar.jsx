import { Monitor, Wifi, Printer, BookOpen } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Gaming',
    description: 'High-performance gaming PCs',
    icon: <Monitor className="w-6 h-6" />,
  },
  {
    id: 2,
    title: 'Internet',
    description: 'High-speed internet access',
    icon: <Wifi className="w-6 h-6" />,
  },
  {
    id: 3,
    title: 'Printing',
    description: 'Print, scan, and copy services',
    icon: <Printer className="w-6 h-6" />,
  },
  {
    id: 4,
    title: 'Study Area',
    description: 'Quiet space for studying',
    icon: <BookOpen className="w-6 h-6" />,
  },
];

const ServicesBar = ({ darkMode }) => {
  return (
    <section
      className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-center md:justify-start"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode
                    ? 'bg-blue-900/50 text-blue-400'
                    : 'bg-blue-100 text-blue-600'
                } mr-3`}
              >
                {service.icon}
              </div>
              <div>
                <h3
                  className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesBar;
