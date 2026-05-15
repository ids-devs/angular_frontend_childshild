export interface AppConfig {
  production: boolean;
  apiURL: {
    root: string;
    auth?: string;
    uploads?: string;
  };
  features: {
    aiEnabled: boolean;
    analytics: boolean;
    debugging: boolean;
    multiTenant: boolean;
  };
  app: {
    name: string;
    version: string;
    description?: string;
  };
  external?: {
    sentry?: {
      dsn: string;
    };
    analytics?: {
      google_analytics_id?: string;
    };
  };
  reverb?: {
    host: string;
    port: number;
    key: string;
    wsPort: number;
    wssPort: number;
    forceTLS: boolean;
  };
  broadcasting?: {
    authEndpoint: string;
  };
}
