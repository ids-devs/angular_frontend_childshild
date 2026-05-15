import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environments/environment';
import { AppConfig } from '../models/app-config.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig = environment;
  private configSubject = new BehaviorSubject<AppConfig>(this.config);

  get config$() {
    return this.configSubject.asObservable();
  }

  getConfig(): AppConfig {
    return this.config;
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.configSubject.next(this.config);
  }

  isProduction(): boolean {
    return this.config.production;
  }

  getApiUrl(endpoint?: string): string {
    const baseUrl = this.config.apiURL.root;
    if (!endpoint) return baseUrl;

    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }

  getFileUrl(path: string): string {
    // Laravel storage files are served at: http://127.0.0.1:8000/storage/path
    // The API base URL is: http://127.0.0.1:8000/api
    // So we need to remove '/api' and add '/storage'
    const baseUrl = this.config.apiURL.root.replace('/api', '');
    return `${baseUrl}/storage/${path}`;
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature] || false;
  }
}
