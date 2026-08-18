// Sample portfolio data for VoxCyber projects
export const portfolioProjects = [
  // Website Projects
  {
    id: 'website-1',
    title: 'Ruth Lengalei Portfolio & Creative Studio',
    description: 'A premium interactive portfolio showcasing creative designs, animations, and modern web applications with seamless UX/UI.',
    image: '/Productivity Pack.webp',
    category: 'websites',
    technologies: ['React', 'Vite', 'Framer Motion', 'Tailwind CSS'],
    link: 'https://ruthlengalei.lovable.app/',
    featured: true,
    completedDate: new Date('2024-05-15')
  },
  {
    id: 'website-2',
    title: 'Naid Solutions Corporate Portal',
    description: 'A sleek, highly performant corporate platform for tech consulting and digital agency solutions with a modern dark theme.',
    image: '/Techsetup.jpg',
    category: 'websites',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    link: 'https://naidsolutions.com/',
    featured: true,
    completedDate: new Date('2024-04-20')
  },
  {
    id: 'website-3',
    title: 'Eunitex Global Business Hub',
    description: 'An institutional website designed for textile importing/exporting, featuring interactive product catalogs and cargo tracking.',
    image: '/notebook.webp',
    category: 'websites',
    technologies: ['React', 'Express', 'Node.js', 'MongoDB'],
    link: 'https://eunitex.com/',
    featured: false,
    completedDate: new Date('2024-03-10')
  },
  {
    id: 'website-4',
    title: 'The Nairobi Daily News',
    description: 'A high-traffic news portal with real-time updates, local and global stories, categories, and ad-management support.',
    image: '/BackToSchool.jpg',
    category: 'websites',
    technologies: ['WordPress', 'SEO', 'PHP', 'MySQL'],
    link: 'https://thenairobidailynews.com/',
    featured: false,
    completedDate: new Date('2024-02-18')
  },
  {
    id: 'website-5',
    title: 'Kindergarten Rouge Education Center',
    description: 'A colorful, engaging, and mobile-friendly educational platform for early childhood education registration, newsletters, and gallery.',
    image: '/earbuds.jpg',
    category: 'websites',
    technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
    link: 'https://kindergarten-rouge.vercel.app/',
    featured: false,
    completedDate: new Date('2024-01-05')
  },

  // Web App Projects
  {
    id: 'webapp-1',
    title: 'Timex Automations System',
    description: 'A specialized web application for industrial automated systems tracking, telemetry, and reporting.',
    image: '/GamingMonitor.avif',
    category: 'webapps',
    technologies: ['React', 'Redux', 'D3.js', 'Node.js'],
    link: 'https://timexautomations.com/',
    featured: true,
    completedDate: new Date('2024-06-01')
  },
  {
    id: 'webapp-2',
    title: 'VoxCyber Cafe Management System',
    description: 'The official online client portal for booking gaming sessions, ordering cyber cafe services, and managing membership points.',
    image: '/FutureCyberCafes.avif',
    category: 'webapps',
    technologies: ['React', 'Tailwind CSS', 'Firebase', 'Netlify'],
    link: 'https://voxcybercafe.netlify.app/',
    featured: true,
    completedDate: new Date('2024-05-10')
  },
  {
    id: 'webapp-3',
    title: 'Kejalink Future Homes Real Estate',
    description: 'A premium property discovery platform featuring virtual house tours, filter search, and direct contact options for modern property seekers.',
    image: '/GamingGearSpectacular.avif',
    category: 'webapps',
    technologies: ['Cloudflare Workers', 'React', 'Tailwind CSS', 'D1 Database'],
    link: 'https://kejalink-future-homes.ruthlengalei.workers.dev/',
    featured: true,
    completedDate: new Date('2024-04-28')
  }
];

// Fallback images for error states
export const fallbackImages = {
  websites: '/notebook.webp',
  webapps: '/Productivity Pack.webp',
  branding: '/logoCyber.png',
  default: '/vocCyberLogo.png'
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