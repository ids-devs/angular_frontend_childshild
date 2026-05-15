export const environment = {
  forceHttps: true,
  production: true,
  appVersion: 'v1.1.0',
  strictHttps: true, // Only allow HTTPS in production
  apiURL: {
    root: 'https://api.childshield.com/api',
    fileRoot: "https://api.childshield.com/api/src/storage",
    responseFormat: "json",
  },

  companny: {
    name: 'IDS - ChildShield Climate AI',
    slogan: 'IDS - ChildShield Climate AI',
    description: 'IDS - ChildShield Climate AI é uma solução de alertas ligados à saúde infantil para famílias, clínicas, ONGs e governo.',
    phone: '+258 84 540 1726',
    website: 'https://ids.childshield.com'
  },
  features: {
    aiEnabled: true,
    analytics: true,
    debugging: false,
    multiTenant: false,
  },
  app: {
    name: 'IDS - ChildShield Climate AI',
    version: 'v1.1.0',
    description:
      'IDS - ChildShield Climate AI é uma solução de alertas ligados à saúde infantil para famílias, clínicas, ONGs e governo.',
  },
};

