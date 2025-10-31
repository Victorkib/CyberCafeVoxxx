// Sample portfolio data for VoxCyber projects
export const portfolioProjects = [
  // Website Projects
  {
    id: 'website-1',
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce platform built with React and Node.js, featuring real-time inventory management, secure payment processing, and responsive design for optimal mobile experience.',
    image: '/client/public/Techsetup.jpg',
    category: 'websites',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Tailwind CSS'],
    link: 'https://example-ecommerce.com',
    featured: true,
    completedDate: new Date('2024-01-15')
  },
  {
    id: 'website-2',
    title: 'Corporate Business Site',
    description: 'Professional corporate website with modern design, SEO optimization, and content management system. Features include team profiles, service pages, and contact forms.',
    image: '/client/public/notebook.webp',
    category: 'websites',
    technologies: ['Next.js', 'TypeScript', 'Sanity CMS', 'Vercel'],
    link: 'https://example-corporate.com',
    featured: false,
    completedDate: new Date('2023-11-20')
  },
  {
    id: 'website-3',
    title: 'Restaurant Chain Website',
    description: 'Multi-location restaurant website with online ordering system, menu management, and location finder. Integrated with third-party delivery services.',
    image: '/client/public/BackToSchool.jpg',
    category: 'websites',
    technologies: ['React', 'Firebase', 'Google Maps API', 'PWA'],
    link: 'https://example-restaurant.com',
    featured: true,
    completedDate: new Date('2023-09-10')
  },

  // Web App Projects
  {
    id: 'webapp-1',
    title: 'Project Management Dashboard',
    description: 'Comprehensive project management application with team collaboration features, task tracking, time management, and real-time notifications.',
    image: '/client/public/Productivity Pack.webp',
    category: 'webapps',
    technologies: ['React', 'Redux', 'Socket.io', 'Express.js', 'PostgreSQL'],
    link: 'https://example-pm-dashboard.com',
    featured: true,
    completedDate: new Date('2024-02-28')
  },
  {
    id: 'webapp-2',
    title: 'Learning Management System',
    description: 'Educational platform with course creation tools, student progress tracking, interactive quizzes, and video streaming capabilities.',
    image: '/client/public/David.jpg',
    category: 'webapps',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'AWS S3', 'WebRTC'],
    link: 'https://example-lms.com',
    featured: false,
    completedDate: new Date('2023-12-05')
  },
  {
    id: 'webapp-3',
    title: 'Financial Analytics Tool',
    description: 'Advanced financial analytics application with data visualization, portfolio tracking, and automated reporting features for investment firms.',
    image: '/client/public/GamingMonitor.avif',
    category: 'webapps',
    technologies: ['Angular', 'D3.js', 'Python', 'Django', 'Redis'],
    link: 'https://example-fintech.com',
    featured: true,
    completedDate: new Date('2024-03-12')
  },

  // Branding Projects
  {
    id: 'branding-1',
    title: 'Tech Startup Brand Identity',
    description: 'Complete brand identity design for a fintech startup, including logo design, color palette, typography, and brand guidelines documentation.',
    image: '/client/public/logoCyber.png',
    category: 'branding',
    technologies: ['Adobe Illustrator', 'Figma', 'Brand Guidelines'],
    featured: true,
    completedDate: new Date('2023-10-18')
  },
  {
    id: 'branding-2',
    title: 'Healthcare Brand Redesign',
    description: 'Brand refresh for a healthcare provider, focusing on trust, accessibility, and modern healthcare values. Includes logo, website design, and marketing materials.',
    image: '/client/public/vocCyberLogo.png',
    category: 'branding',
    technologies: ['Adobe Creative Suite', 'Brand Strategy', 'UI/UX Design'],
    featured: false,
    completedDate: new Date('2023-08-22')
  },
  {
    id: 'branding-3',
    title: 'E-Sports Team Branding',
    description: 'Dynamic brand identity for professional e-sports team, including logo variations, team jerseys, social media templates, and merchandise design.',
    image: '/client/public/GamingGearSpectacular.avif',
    category: 'branding',
    technologies: ['Adobe Illustrator', 'Photoshop', 'After Effects'],
    featured: true,
    completedDate: new Date('2024-01-08')
  }
];

// Fallback images for error states
export const fallbackImages = {
  websites: '/client/public/notebook.webp',
  webapps: '/client/public/Productivity Pack.webp',
  branding: '/client/public/logoCyber.png',
  default: '/client/public/vocCyberLogo.png'
};

// Helper functions
export const getProjectsByCategory = (category) => {
  if (category === 'all') {
    return portfolioProjects;
  }
  return portfolioProjects.filter(project => project.category === category);
};

export const getFeaturedProjects = () => {
  return portfolioProjects.filter(project => project.featured);
};

export const getProjectCounts = () => {
  const counts = {
    all: portfolioProjects.length,
    websites: 0,
    webapps: 0,
    branding: 0
  };

  portfolioProjects.forEach(project => {
    counts[project.category]++;
  });

  return counts;
};

export const getProjectById = (id) => {
  return portfolioProjects.find(project => project.id === id);
};

// Sort projects by completion date (newest first)
export const getSortedProjects = (category = 'all') => {
  const projects = getProjectsByCategory(category);
  return projects.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
};