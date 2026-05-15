import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getDashboardData(): Observable<{ overview: any; riskMap: any; alerts: any }> {
    return forkJoin({
      overview: this.http.get<any>(this.config.getApiUrl('v1/dashboard/overview')),
      riskMap: this.http.get<any>(this.config.getApiUrl('v1/dashboard/risk-map')),
      alerts: this.http.get<any>(this.config.getApiUrl('v1/alerts'), { params: { per_page: '5' } }),
    });
  }

  getAlertById(id: number): Observable<any> {
    return this.http.get<any>(this.config.getApiUrl(`v1/alerts/${id}`));
  }
}
