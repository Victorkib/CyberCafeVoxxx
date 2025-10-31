export const servicesData = [
  {
    id: 'website-development',
    title: 'Website Development',
    description: 'Transform your digital presence with custom, responsive websites built using cutting-edge technologies. We create fast, secure, and scalable web solutions that drive business growth.',
    icon: '🌐',
    features: [
      'Custom responsive design',
      'Modern frameworks (React, Next.js, Vue)',
      'Performance optimization & SEO',
      'Cross-browser compatibility',
      'Mobile-first approach',
      'Content Management Systems'
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    pricing: {
      starting: 2500,
      currency: 'USD'
    }
  },
  {
    id: 'web-apps-development',
    title: 'Web Apps Development',
    description: 'Build powerful, interactive web applications that provide native app-like experiences. From progressive web apps to complex enterprise solutions.',
    icon: '📱',
    features: [
      'Progressive Web Apps (PWA)',
      'Single Page Applications (SPA)',
      'Real-time functionality',
      'API integration & development',
      'Database design & optimization',
      'Cloud deployment & scaling'
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Firebase'],
    pricing: {
      starting: 5000,
      currency: 'USD'
    }
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    description: 'Create intuitive, engaging user experiences through research-driven design. We focus on user-centered design principles to maximize conversion and satisfaction.',
    icon: '🎨',
    features: [
      'User research & personas',
      'Wireframing & prototyping',
      'Design systems & style guides',
      'Usability testing',
      'Accessibility compliance',
      'Brand identity integration'
    ],
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision'],
    pricing: {
      starting: 1500,
      currency: 'USD'
    }
  },
  {
    id: 'seo-performance',
    title: 'SEO & Performance Optimization',
    description: 'Boost your search rankings and site performance with technical SEO, Core Web Vitals optimization, and comprehensive analytics setup.',
    icon: '🚀',
    features: [
      'Technical SEO audit & fixes',
      'Core Web Vitals optimization',
      'Page speed improvements',
      'Analytics & tracking setup',
      'Keyword research & strategy',
      'Local SEO optimization'
    ],
    technologies: ['Google Analytics', 'Search Console', 'Lighthouse', 'GTM'],
    pricing: {
      starting: 800,
      currency: 'USD'
    }
  },
  {
    id: 'branding-strategy',
    title: 'Branding & Digital Strategy',
    description: 'Develop a cohesive brand identity and comprehensive digital marketing strategy that resonates with your target audience and drives business growth.',
    icon: '💡',
    features: [
      'Brand identity & logo design',
      'Digital marketing strategy',
      'Content strategy & planning',
      'Social media presence',
      'Competitor analysis',
      'Brand guidelines & assets'
    ],
    technologies: ['Adobe Creative Suite', 'Canva', 'Hootsuite', 'Buffer'],
    pricing: {
      starting: 1200,
      currency: 'USD'
    }
  }
];

export const getServiceById = (id) => {
  return servicesData.find(service => service.id === id);
};

export const getServicesByCategory = (category) => {
  // Future enhancement for service categories
  return servicesData;
};