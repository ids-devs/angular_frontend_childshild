export const environment = {
    production: false,
    strictHttps: false,
    appVersion: 'v1.1.0',
    apiURL: {
        root: 'http://localhost:8000/api',
        fileRoot: "http://localhost:8000/api/src/storage",
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
      aiEnabled: false,
      analytics: false,
      debugging: true,
      multiTenant: false,
    },
    app: {
      name: 'IDS - ChildShield Climate AI',
      version: 'v1.1.0',
      description:
        'IDS - ChildShield Climate AI é uma solução de alertas ligados à saúde infantil para famílias, clínicas, ONGs e governo.',
    },
};

