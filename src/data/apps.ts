export interface App {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export const apps: App[] = [
  {
    id: 'writing-editor',
    title: 'AI Logistics Optimizer',
    description: 'Cut delivery costs and delays with real-time fleet tracking and AI-powered route optimization.',
    image: '/ai logistics thumbnail.png',
    category: 'Productivity',
    features: [
      'Live fleet tracking',
      'Route optimization',
      'Real-time metrics',
      'Predictive insights',
      'Cost analytics'
    ],
    technologies: ['React', 'TypeScript', 'OpenAI API', 'Tailwind CSS'],
    demoUrl: '/apps/writing-editor'
  },
  {
    id: 'ai-logistics-optimizer-2',
    title: 'AI Real Estate Deal Analyzer',
    description: 'Streamline property investment decisions with AI-powered financial modeling, automated deal analysis, and professional reporting for multi-family real estate portfolios.',
    image: '/ai real estate.png',
    category: 'Productivity',
    features: [
      'Automated deal analysis',
      'Professional PDF reports',
      'AI-powered insights',
      'Financial modeling',
      'Portfolio management'
    ],
    technologies: ['React', 'Recharts', 'Claude API', 'TypeScript'],
    demoUrl: '/apps/ai-logistics-optimizer-2'
  }
];

export const getAppById = (id: string): App | undefined => {
  return apps.find(app => app.id === id);
};

export const getAppsByCategory = (category: string): App[] => {
  return apps.filter(app => app.category === category);
};
