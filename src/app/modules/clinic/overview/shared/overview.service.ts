import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Alert, ClinicKPI, RiskMapZone } from '../../shared/types/clinic.types';
import { ConfigService } from 'src/app/core/services/config.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private ctx = inject(ClinicContextService);

  loadOverview(): Observable<{ kpi: ClinicKPI; riskZones: RiskMapZone[]; recentAlerts: Alert[] }> {
    const locationId = this.ctx.scopeLocationId();
    const overviewParams: Record<string, string> = {};
    const alertsParams: Record<string, string> = { per_page: '5' };
    if (locationId) {
      overviewParams['location_id'] = String(locationId);
      alertsParams['location_id'] = String(locationId);
    }

    return forkJoin({
      overview: this.http.get<any>(this.config.getApiUrl('v1/dashboard/overview'), { params: overviewParams }) as Observable<any>,
      riskMap: this.http.get<any>(this.config.getApiUrl('v1/dashboard/risk-map')) as Observable<any>,
      families: this.http.get<any>(this.config.getApiUrl('v1/dashboard/families')) as Observable<any>,
      alerts: this.http.get<any>(this.config.getApiUrl('v1/alerts'), { params: alertsParams }) as Observable<any>,
      symptoms: this.http.get<any>(this.config.getApiUrl('v1/symptoms/aggregated')) as Observable<any>,
    }).pipe(
      map(({ overview, riskMap, families, alerts, symptoms }) => {
        const overviewData = overview.data ?? {};
        const byChannel = families.data?.by_channel ?? {};
        const totalFamilies = Number(overviewData.total_families ?? families.data?.total ?? 0);
        const estimatedChildren = Math.round(totalFamilies * 2.9);
        const coverage = Number(overviewData.alerts_coverage_rate ?? 0);
        const reachedFamilies = Math.round((totalFamilies * coverage) / 100);

        const bySymptom = symptoms.data?.by_symptom ?? {};
        const riskZones = (riskMap.data ?? []).map((item: any) => this.mapRiskZone(item)) as RiskMapZone[];
        const topRisk = riskZones.slice(0, 4);

        const kpi: ClinicKPI = {
          registered_families: totalFamilies,
          estimated_children: estimatedChildren,
          active_alerts: Number(overviewData.active_high_risks ?? 0),
          alert_coverage_percent: coverage,
          expected_consultations: {
            malaria: Number(bySymptom.malaria_symptoms ?? bySymptom.fever ?? 0),
            heat: Number(bySymptom.respiratory ?? 0),
            diarrhea: Number(bySymptom.diarrhea ?? 0),
            respiratory: Number(bySymptom.cough ?? 0),
          },
          recommended_stock: {
            antimalarials: Math.max(50, Math.round((topRisk.find((z) => z.risk_type === 'malaria')?.families_count ?? 100) * 0.25)),
            ors: Math.max(30, Math.round((topRisk.find((z) => z.risk_type === 'diarrhea')?.families_count ?? 80) * 0.18)),
            iv_solutions: Math.max(10, Math.round((topRisk.find((z) => z.risk_type === 'heat')?.families_count ?? 60) * 0.08)),
          },
          unreached_vulnerable: Math.max(totalFamilies - reachedFamilies, 0),
          trend_7days: this.buildTrend(overviewData.alerts_by_level ?? {}, Number(symptoms.data?.total_reports ?? 0)),
        };

        const recentAlerts = (alerts.data ?? []).map((item: any) => this.mapAlert(item)) as Alert[];
        return { kpi, riskZones, recentAlerts };
      })
    );
  }

  private mapRiskZone(item: any): RiskMapZone {
    const risks = item.risks ?? {};
    const preferredType = ['malaria', 'heat', 'diarrhea', 'respiratory'].find((code) => risks[code]) ?? 'malaria';
    const risk = risks[preferredType] ?? { level: 'low', score: 0 };
    return {
      province: item.province ?? '',
      district: item.district ?? '',
      risk_level: risk.level ?? 'low',
      score: Number(risk.score ?? 0),
      risk_type: preferredType as any,
      families_count: Number(item.families_count ?? 0),
      children_count: Number(item.children_count ?? 0),
    };
  }

  private mapAlert(item: any): Alert {
    const location = item.location ?? {};
    return {
      id: item.id,
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
      risk_type: item.risk_type?.code ?? item.riskType?.code ?? item.risk_type ?? 'heat',
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

  private buildTrend(alertsByLevel: Record<string, number>, totalSymptoms: number): { date: string; alerts: number; symptoms: number }[] {
    const totalAlerts = Object.values(alertsByLevel).reduce((acc, curr) => acc + Number(curr), 0);
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      const label = day.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
      return {
        date: label,
        alerts: Math.max(0, Math.round((totalAlerts / 7) * (0.75 + index * 0.05))),
        symptoms: Math.max(0, Math.round((totalSymptoms / 7) * (0.7 + index * 0.06))),
      };
    });
  }
}
