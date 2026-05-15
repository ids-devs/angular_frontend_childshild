import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { DashboardService } from '../shared/dashboard.service';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexAxisChartSeries,
  NgApexchartsModule,
} from 'ng-apexcharts';
import * as L from 'leaflet';

type DonutChart = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  colors: string[];
};

type BarChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  colors: string[];
};

@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, NgApexchartsModule],
  templateUrl: './dashboard-list.component.html',
})
export class DashboardListComponent implements OnInit, AfterViewInit {
  private service = inject(DashboardService);
  @ViewChild('riskMapContainer') riskMapContainer?: ElementRef<HTMLDivElement>;

  loading = signal(true);
  overview = signal<any>(null);
  riskMap = signal<any[]>([]);
  alerts = signal<any[]>([]);
  selectedRiskLevel = signal<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  selectedRiskType = signal<string>('all');
  riskDonut = signal<Partial<DonutChart>>({});
  alertStatusBar = signal<Partial<BarChart>>({});
  riskTypeOptions = signal<string[]>([]);

  filteredZones = computed(() => {
    const level = this.selectedRiskLevel();
    const type = this.selectedRiskType();
    return this.riskMap()
      .map((zone) => this.zoneWithWorstRisk(zone))
      .filter((zone) => (level === 'all' ? true : zone.level === level))
      .filter((zone) => (type === 'all' ? true : zone.type === type));
  });

  filteredAlerts = computed(() => {
    const level = this.selectedRiskLevel();
    const type = this.selectedRiskType();
    return this.alerts()
      .filter((alert) => (level === 'all' ? true : (alert.risk_level ?? 'low') === level))
      .filter((alert) => (type === 'all' ? true : (alert.risk_type?.code ?? alert.risk_type ?? 'unknown') === type));
  });

  criticalZones = computed(() =>
    this.filteredZones()
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  );
  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private viewReady = false;

  ngOnInit(): void {
    this.service.getDashboardData().subscribe(({ overview, riskMap, alerts }) => {
      this.overview.set(overview.data ?? {});
      this.riskMap.set(riskMap.data ?? []);
      this.alerts.set(alerts.data ?? []);
      this.riskTypeOptions.set(this.extractRiskTypes());
      this.buildCharts();
      this.renderRiskMap();
      this.loading.set(false);
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderRiskMap();
  }

  private buildCharts(): void {
    const zones = this.filteredZones();
    const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>;
    zones.forEach((zone) => {
      riskCounts[zone.level] = (riskCounts[zone.level] ?? 0) + 1;
    });

    this.riskDonut.set({
      series: [riskCounts['critical'], riskCounts['high'], riskCounts['medium'], riskCounts['low']],
      labels: ['Crítico', 'Alto', 'Médio', 'Baixo'],
      chart: { type: 'donut', height: 280, fontFamily: 'inherit' },
      colors: ['#EF4444', '#F97316', '#FACC15', '#22C55E'],
      plotOptions: { pie: { donut: { size: '65%' } } },
      dataLabels: { enabled: false },
      stroke: { show: false },
      legend: { position: 'bottom', fontSize: '12px' },
      tooltip: { theme: 'dark' },
    });

    const statusCounts: Record<string, number> = { pending: 0, sent: 0, delivered: 0, failed: 0, cancelled: 0 };
    this.filteredAlerts().forEach((alert) => {
      statusCounts[alert.status] = (statusCounts[alert.status] ?? 0) + 1;
    });
    this.alertStatusBar.set({
      series: [{ name: 'Alertas', data: [statusCounts['pending'], statusCounts['sent'], statusCounts['delivered'], statusCounts['failed'], statusCounts['cancelled']] }],
      chart: { type: 'bar', height: 280, toolbar: { show: false }, fontFamily: 'inherit' },
      colors: ['#3B82F6'],
      xaxis: { categories: ['Pendente', 'Enviado', 'Entregue', 'Falhou', 'Cancelado'] },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { theme: 'dark' },
    });
  }

  private zoneWithWorstRisk(zone: any): { district: string; province: string; score: number; level: string; type: string } {
    const risks = zone.risks ?? {};
    const entries = Object.entries(risks) as Array<[string, { level: string; score: number }]>;
    if (!entries.length) {
      return { district: zone.district ?? 'N/D', province: zone.province ?? 'N/D', score: 0, level: 'low', type: 'unknown' };
    }
    const [type, risk] = entries.sort((a, b) => Number(b[1].score ?? 0) - Number(a[1].score ?? 0))[0];
    return {
      district: zone.district ?? 'N/D',
      province: zone.province ?? 'N/D',
      score: Number(risk.score ?? 0),
      level: risk.level ?? 'low',
      type,
    };
  }

  private renderRiskMap(): void {
    if (!this.viewReady || !this.riskMapContainer?.nativeElement || !this.riskMap().length) return;

    if (!this.map) {
      this.map = L.map(this.riskMapContainer.nativeElement, {
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);
    }

    this.markersLayer?.clearLayers();
    const points: L.LatLngTuple[] = [];

    this.filteredZones().forEach((zone) => {
      const raw = this.riskMap().find((item) => item.district === zone.district && item.province === zone.province);
      const lat = Number(raw?.latitude);
      const lng = Number(raw?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const color = this.riskLevelColor(zone.level);
      const intensity = Math.max(10, Math.min(34, Math.round(zone.score / 3)));

      L.circle([lat, lng], {
        radius: intensity * 250,
        color,
        fillColor: color,
        fillOpacity: 0.16,
        weight: 0,
      }).addTo(this.markersLayer!);

      L.circleMarker([lat, lng], {
        radius: Math.max(8, Math.min(18, Math.round(zone.score / 8))),
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      })
        .bindPopup(`
          <div style="font-family:inherit;min-width:180px">
            <strong>${zone.district}, ${zone.province}</strong><br/>
            Nível: <b>${zone.level.toUpperCase()}</b><br/>
            Tipo: ${zone.type}<br/>
            Score: ${zone.score}
          </div>
        `)
        .addTo(this.markersLayer!);

      points.push([lat, lng]);
    });

    if (!points.length) return;
    this.map.fitBounds(points, { padding: [24, 24], maxZoom: 7 });
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  onFilterChange(): void {
    this.buildCharts();
    this.renderRiskMap();
  }

  clearFilters(): void {
    this.selectedRiskLevel.set('all');
    this.selectedRiskType.set('all');
    this.onFilterChange();
  }

  private riskLevelColor(level: string): string {
    const palette: Record<string, string> = {
      critical: '#DC2626',
      high: '#F97316',
      medium: '#EAB308',
      low: '#22C55E',
    };
    return palette[level] ?? '#3B82F6';
  }

  cardGradient(kind: 'families' | 'alerts' | 'risk' | 'coverage'): string {
    const gradients: Record<string, string> = {
      families: 'from-blue-600 to-cyan-500',
      alerts: 'from-amber-500 to-orange-500',
      risk: 'from-rose-600 to-red-500',
      coverage: 'from-emerald-600 to-green-500',
    };
    return gradients[kind];
  }

  statusBadgeClass(level: string): string {
    const map: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return map[level] ?? 'bg-gray-100 text-gray-600';
  }

  alertMessage(alert: any): string {
    return alert.message_sms || alert.message_whatsapp || alert.message || `${alert.risk_level ?? 'Risco'} - ${alert.channel ?? 'sms'}`;
  }

  riskTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      malaria: 'Malária',
      heat: 'Calor',
      diarrhea: 'Diarreia',
      respiratory: 'Respiratório',
      unknown: 'Desconhecido',
    };
    return labels[type] ?? type;
  }

  private extractRiskTypes(): string[] {
    const types = this.riskMap()
      .map((zone) => this.zoneWithWorstRisk(zone).type)
      .filter((value, index, arr) => arr.indexOf(value) === index);
    return types.length ? types : ['unknown'];
  }
}
