import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { FilterOptions, PaginatedResponse, SymptomReport } from '../../shared/types/clinic.types';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class SymptomReportsService {
  private ctx = inject(ClinicContextService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getSymptomReports(filters: FilterOptions = {}): Observable<PaginatedResponse<SymptomReport>> {
    const params: Record<string, string> = {
      page: String(filters.page ?? 1),
      per_page: String(filters.per_page ?? 10),
    };
    const locationId = this.ctx.scopeLocationId();
    if (locationId) params['location_id'] = String(locationId);
    if (filters.search) params['search'] = filters.search;

    return this.http.get<any>(this.config.getApiUrl('v1/symptoms'), { params }).pipe(
      map((response) => {
        let data = (response.data ?? []).map((item: any) => this.mapReport(item)) as SymptomReport[];
        const scope = this.ctx.scopeFilter();
        const province = scope.province ?? filters.province;
        const district = scope.district ?? filters.district;
        const locality = scope.locality ?? filters.locality;
        if (province) data = data.filter((r) => r.location.province === province);
        if (district) data = data.filter((r) => r.location.district === district);
        if (locality) data = data.filter((r) => r.location.locality === locality);
        if (filters.status === 'reviewed') data = data.filter((r) => r.reviewed);
        if (filters.status === 'pending') data = data.filter((r) => !r.reviewed);
        return {
          data,
          total: response.meta?.total ?? data.length,
          page: response.meta?.current_page ?? 1,
          per_page: response.meta?.per_page ?? 10,
          last_page: response.meta?.last_page ?? 1,
        };
      })
    );
  }

  getById(id: number): Observable<SymptomReport | undefined> {
    return this.http.get<any>(this.config.getApiUrl('v1/symptoms'), {
      params: { page: '1', per_page: '100' },
    }).pipe(
      map((response) => {
        const list = (response.data ?? []).map((item: any) => this.mapReport(item)) as SymptomReport[];
        return list.find((report) => report.id === id);
      })
    );
  }

  markReviewed(id: number): Observable<boolean> {
    return of(true);
  }

  getSymptomSummary(): Observable<Record<string, number>> {
    return this.http.get<any>(this.config.getApiUrl('v1/symptoms/aggregated')).pipe(
      map((response) => response.data?.by_symptom ?? {})
    );
  }

  getProvinces(): string[] {
    return this.ctx.getProvinces();
  }

  getDistricts(province: string): string[] {
    return this.ctx.getDistricts(province);
  }

  getLocalities(province: string, district: string): string[] {
    return this.ctx.getLocalities(province, district);
  }

  private mapReport(item: any): SymptomReport {
    const location = item.location ?? {};
    return {
      id: item.id,
      phone_number: item.user?.phone_number ?? item.phone_number ?? 'Oculto',
      symptoms: item.symptoms ?? [],
      location: {
        id: location.id ?? item.location_id ?? 0,
        province: location.province?.name ?? location.province ?? '',
        district: location.district?.name ?? location.district ?? '',
        locality: location.locality ?? '',
        latitude: Number(location.latitude ?? 0),
        longitude: Number(location.longitude ?? 0),
        malaria_risk_static: Number(location.malaria_risk_static ?? 0),
        sanitation_score: Number(location.sanitation_score ?? 0),
        flood_risk: Number(location.flood_risk ?? 0),
        is_coastal: Boolean(location.is_coastal),
        is_urban: Boolean(location.is_urban),
      },
      channel: item.channel ?? 'whatsapp',
      notes: item.notes ?? '',
      created_at: item.created_at,
      reviewed: Boolean(item.reviewed_at ?? item.reviewed),
    };
  }
}
