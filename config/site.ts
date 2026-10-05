export const SITE_CONFIG = {
  name: 'APbase',
  description: 'Infraestrutura geoespacial para agricultura de precisão — documentação e pacotes.',
  url: process.env.NEXT_PUBLIC_API_URL || 'https://apbase.io',
  links: {
    github: 'https://github.com/ap-base/apbase-python',
  },
} as const;
