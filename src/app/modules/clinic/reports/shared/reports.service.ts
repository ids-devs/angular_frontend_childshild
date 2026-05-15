import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FilterOptions, PaginatedResponse, Report, ReportFormat, ReportType } from '../../shared/types/clinic.types';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private ctx = inject(ClinicContextService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getReports(filters: FilterOptions = {}): Observable<PaginatedResponse<Report>> {
    const scope = this.ctx.scopeFilter();
    const params: Record<string, string> = {
      page: String(filters.page ?? 1),
      per_page: String(filters.per_page ?? 10),
    };

    const province = scope.province ?? filters.province;
    const district = scope.district ?? filters.district;
    if (province) params['province'] = province;
    if (district) params['district'] = district;
    if (filters.status) params['status'] = filters.status;
    if (filters.search) params['search'] = filters.search;

    return this.http.get<any>(this.config.getApiUrl('v1/reports'), { params }).pipe(
      map((response) => ({
        data: response.data as Report[],
        total: response.meta?.total ?? 0,
        page: response.meta?.current_page ?? 1,
        per_page: response.meta?.per_page ?? 10,
        last_page: response.meta?.last_page ?? 1,
      }))
    );
  }

  getReportById(id: number): Observable<Report | undefined> {
    return this.http.get<any>(this.config.getApiUrl(`v1/reports/${id}`)).pipe(
      map((response) => response.data as Report)
    );
  }

  generateReport(payload: {
    province: string;
    district?: string;
    report_type: ReportType;
    format: ReportFormat;
    period_start: string;
    period_end: string;
  }): Observable<Report> {
    return this.http.post<any>(this.config.getApiUrl('v1/reports'), payload).pipe(
      map((response) => response.data as Report)
    );
  }

  getProvinces(): string[] {
    const extra = this.ctx.isOng() ? ['Nacional'] : [];
    return [...extra, ...this.ctx.getProvinces()];
  }

  getDistricts(province: string): string[] {
    return this.ctx.getDistricts(province);
  }

  getScopeFilter() {
    return this.ctx.scopeFilter();
  }
}
