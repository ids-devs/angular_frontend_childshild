import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FilterOptions, Household, PaginatedResponse } from '../../shared/types/clinic.types';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class FamiliesService {
  private ctx = inject(ClinicContextService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getFamilies(filters: FilterOptions = {}): Observable<PaginatedResponse<Household>> {
    const scope = this.ctx.scopeFilter();
    const params: Record<string, string> = {
      page: String(filters.page ?? 1),
      per_page: String(filters.per_page ?? 10),
    };

    const province = scope.province ?? filters.province;
    const district = scope.district ?? filters.district;
    const locality = scope.locality ?? filters.locality;
    if (province) params['province'] = province;
    if (district) params['district'] = district;
    if (locality) params['locality'] = locality;
    if (filters.search) params['search'] = filters.search;
    if (filters.status) params['status'] = filters.status;

    return this.http.get<any>(this.config.getApiUrl('v1/families'), { params }).pipe(
      map((response) => ({
        data: response.data as Household[],
        total: response.meta?.total ?? 0,
        page: response.meta?.current_page ?? 1,
        per_page: response.meta?.per_page ?? 10,
        last_page: response.meta?.last_page ?? 1,
      }))
    );
  }

  getFamilyById(id: number): Observable<Household | undefined> {
    return this.http.get<any>(this.config.getApiUrl(`v1/families/${id}`)).pipe(
      map((response) => response.data as Household)
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

  getStats(): Observable<{ total: number; active: number; high_vulnerability: number; with_pregnant: number }> {
    return this.http.get<any>(this.config.getApiUrl('v1/families/stats')).pipe(
      map((response) => response.data as { total: number; active: number; high_vulnerability: number; with_pregnant: number })
    );
  }
}
