import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Alert, FilterOptions, PaginatedResponse, RiskLevel, RiskType } from '../../shared/types/clinic.types';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private ctx = inject(ClinicContextService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getAlerts(filters: FilterOptions = {}): Observable<PaginatedResponse<Alert>> {
    const scope = this.ctx.scopeFilter();
    const params: Record<string, string> = {
      page: String(filters.page ?? 1),
      per_page: String(filters.per_page ?? 10),
    };

    const locationId = this.ctx.scopeLocationId();
    if (locationId) params['location_id'] = String(locationId);
    if (filters.risk_level) params['risk_level'] = filters.risk_level;
    if (filters.status) params['status'] = filters.status;

    return this.http.get<any>(this.config.getApiUrl('v1/alerts'), { params }).pipe(
      map((response) => {
        let data = (response.data ?? []).map((item: any) => this.mapAlert(item)) as Alert[];
        const province = scope.province ?? filters.province;
        const district = scope.district ?? filters.district;
        const locality = scope.locality ?? filters.locality;

        if (province) data = data.filter((a) => a.location.province === province);
        if (district) data = data.filter((a) => a.location.district === district);
        if (locality) data = data.filter((a) => a.location.locality === locality);
        if (filters.risk_type) data = data.filter((a) => a.risk_type === filters.risk_type);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter((a) => a.message.toLowerCase().includes(q) || a.location.district.toLowerCase().includes(q));
        }

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

  getAlertById(id: number): Observable<Alert | undefined> {
    return this.http.get<any>(this.config.getApiUrl(`v1/alerts/${id}`)).pipe(
      map((response) => this.mapAlert(response.data))
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

  getRiskLevels(): RiskLevel[] {
    return ['low', 'medium', 'high', 'critical'];
  }

  getRiskTypes(): RiskType[] {
    return ['heat', 'malaria', 'diarrhea', 'respiratory'];
  }

  private mapAlert(item: any): Alert {
    const location = item.location ?? {};
    const province = location.province?.name ?? location.province ?? '';
    const district = location.district?.name ?? location.district ?? '';
    const riskType = item.risk_type?.code ?? item.riskType?.code ?? item.risk_type ?? 'heat';
    return {
      id: item.id,
      location: {
        id: location.id ?? item.location_id ?? 0,
        province,
        district,
        locality: location.locality ?? '',
        latitude: Number(location.latitude ?? 0),
        longitude: Number(location.longitude ?? 0),
        malaria_risk_static: Number(location.malaria_risk_static ?? 0),
        sanitation_score: Number(location.sanitation_score ?? 0),
        flood_risk: Number(location.flood_risk ?? 0),
        is_coastal: Boolean(location.is_coastal),
        is_urban: Boolean(location.is_urban),
      },
      risk_type: riskType,
      risk_level: item.risk_level ?? 'low',
      score: Number(item.score ?? item.risk_score?.score ?? 0),
      message: item.message_sms ?? item.message_whatsapp ?? item.message ?? '',
      channel: item.channel ?? 'sms',
      status: item.status ?? 'pending',
      sent_at: item.sent_at ?? item.created_at,
      delivery_report: item.delivery_report,
      created_at: item.created_at,
    };
  }
}
