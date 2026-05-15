import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Campaign, FilterOptions, PaginatedResponse, RiskType } from '../../shared/types/clinic.types';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private ctx = inject(ClinicContextService);
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  getCampaigns(filters: FilterOptions = {}): Observable<PaginatedResponse<Campaign>> {
    const params: Record<string, string> = {
      page: String(filters.page ?? 1),
      per_page: String(filters.per_page ?? 10),
    };
    if (filters.status) params['status'] = filters.status;

    return this.http.get<any>(this.config.getApiUrl('v1/campaigns'), { params }).pipe(
      map((response) => {
        const scope = this.ctx.scopeFilter();
        let data = (response.data ?? []).map((item: any) => this.mapCampaign(item)) as Campaign[];
        const province = scope.province ?? filters.province;
        const district = scope.district ?? filters.district;
        if (province) data = data.filter((c) => c.province === province);
        if (district) data = data.filter((c) => c.district === district);
        if (filters.risk_type) data = data.filter((c) => c.risk_type === filters.risk_type);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter((c) => c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q));
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

  getCampaignById(id: number): Observable<Campaign | undefined> {
    return this.http.get<any>(this.config.getApiUrl(`v1/campaigns/${id}`)).pipe(
      map((response) => this.mapCampaign(response.data))
    );
  }

  createCampaign(payload: Omit<Campaign, 'id' | 'created_at' | 'delivered' | 'failed'>): Observable<Campaign> {
    const requestPayload = {
      name: payload.name,
      message_sms: payload.message,
      message_whatsapp: payload.message,
      target_provinces: payload.province ? [payload.province] : [],
      target_districts: payload.district ? [payload.district] : [],
      risk_type: payload.risk_type,
      scheduled_at: payload.scheduled_at || null,
      status: payload.status,
    };
    return this.http.post<any>(this.config.getApiUrl('v1/campaigns'), requestPayload).pipe(
      map((response) => this.mapCampaign(response.data))
    );
  }

  updateCampaignStatus(id: number, status: Campaign['status']): Observable<boolean> {
    if (status === 'sent') {
      return this.http.patch<any>(this.config.getApiUrl(`v1/campaigns/${id}/cancel`), {}).pipe(map(() => true));
    }
    return this.http.patch<any>(this.config.getApiUrl(`v1/campaigns/${id}/cancel`), {}).pipe(map(() => true));
  }

  getProvinces(): string[] {
    return this.ctx.getProvinces();
  }

  getDistricts(province: string): string[] {
    return this.ctx.getDistricts(province);
  }

  getRiskTypes(): RiskType[] {
    return ['heat', 'malaria', 'diarrhea', 'respiratory'];
  }

  private mapCampaign(item: any): Campaign {
    const firstProvince = item.target_provinces?.[0] ?? '';
    const firstDistrict = item.target_districts?.[0] ?? '';
    return {
      id: item.id,
      name: item.name ?? '',
      message: item.message_sms ?? item.message_whatsapp ?? '',
      zone: firstProvince || firstDistrict,
      province: firstProvince,
      district: firstDistrict,
      risk_type: item.risk_type ?? 'heat',
      status: item.status ?? 'draft',
      scheduled_at: item.scheduled_at,
      sent_at: item.sent_at,
      total_recipients: Number(item.recipients_total ?? 0),
      delivered: Number(item.deliveries_success ?? 0),
      failed: Number(item.deliveries_failed ?? 0),
      created_at: item.created_at,
      created_by: item.creator?.name ?? 'Sistema',
    };
  }
}
