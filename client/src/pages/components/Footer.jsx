import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Clock1,
} from 'lucide-react';

const Footer = ({ darkMode }) => {
  return (
    <footer
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4
              className={`text-lg font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-4`}
            >
              About VoxCyber
            </h4>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              We are a leading provider of tech solutions, offering
              high-performance gaming PCs, fast internet access, and
              comprehensive computer services.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className={`p-2 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-600 text-gray-600'
                } hover:text-white transition-colors`}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className={`p-2 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-600 text-gray-600'
                } hover:text-white transition-colors`}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.instagram.com/voxcyber"
                target="_blank"
                className={`p-2 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-600 text-gray-600'
                } hover:text-white transition-colors`}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className={`p-2 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-600 text-gray-600'
                } hover:text-white transition-colors`}
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4
              className={`text-lg font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-4`}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  Websites
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4
              className={`text-lg font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-4`}
            >
              Contact Information
            </h4>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } flex items-center mb-2`}
            >
              <MapPin size={16} className="mr-2" />
              123 Tech Street, Cyberville, CA 91234
            </p>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } flex items-center mb-2`}
            >
              <Phone size={16} className="mr-2" />
              (555) 123-4567
            </p>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              } flex items-center`}
            >
              <Clock1 size={16} className="mr-2" />
              Mon - Fri: 9am - 6pm
            </p>
          </div>
          <div>
            <h4
              className={`text-lg font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-4`}
            >
              Subscribe to Newsletter
            </h4>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-4`}
            >
              Stay up-to-date with our latest offers and tech news.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full py-2 px-4 rounded-l-md border ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                } focus:outline-none focus:border-blue-500`}
                aria-label="Email address"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-r-md transition-colors"
                aria-label="Subscribe"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p
            className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            &copy; {new Date().getFullYear()} VoxCyber. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
