import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexStroke, ApexFill, ApexTooltip, ApexGrid, ApexPlotOptions, ApexLegend } from 'ng-apexcharts';
import { StatCardComponent } from '../shared/components/stat-card/stat-card.component';
import { RiskBadgeComponent } from '../shared/components/risk-badge/risk-badge.component';
import { SkeletonCardComponent } from '../shared/components/skeleton/skeleton-card.component';
import { ClinicRoleSwitcherComponent } from '../shared/components/role-switcher/clinic-role-switcher.component';
import { ClinicContextService } from '../shared/services/clinic-context.service';
import { Alert, ClinicKPI, RiskMapZone } from '../shared/types/clinic.types';
import { RouterModule } from '@angular/router';
import { OverviewService } from './shared/overview.service';

export type TrendChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  legend: ApexLegend;
};

export type RiskChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  grid: ApexGrid;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    NgApexchartsModule,
    StatCardComponent,
    RiskBadgeComponent,
    SkeletonCardComponent,
    ClinicRoleSwitcherComponent,
    RouterModule,
  ],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  ctx = inject(ClinicContextService);
  private service = inject(OverviewService);

  loading = signal(true);
  kpi = signal<ClinicKPI | null>(null);
  riskZones = signal<RiskMapZone[]>([]);
  recentAlerts = signal<Alert[]>([]);

  trendChart!: Partial<TrendChartOptions>;
  riskChart!: Partial<RiskChartOptions>;

  riskTypeLabels: Record<string, string> = {
    heat: 'Calor', malaria: 'Malária', diarrhea: 'Diarreia', respiratory: 'Respiratório',
  };
  riskTypeIcons: Record<string, string> = {
    heat: 'whatshot', malaria: 'bug_report', diarrhea: 'water_drop', respiratory: 'air',
  };

  ngOnInit(): void {
    this.service.loadOverview().subscribe(({ kpi, riskZones, recentAlerts }) => {
      this.kpi.set(kpi);
      this.riskZones.set(riskZones);
      this.recentAlerts.set(recentAlerts);
      this.initCharts(kpi);
      this.loading.set(false);
    });
  }

  private initCharts(kpi: ClinicKPI): void {
    const trend = kpi.trend_7days;
    this.trendChart = {
      series: [
        { name: 'Alertas Enviados', data: trend.map((d) => d.alerts) },
        { name: 'Sintomas Reportados', data: trend.map((d) => d.symptoms) },
      ],
      chart: { type: 'area', height: 240, fontFamily: 'inherit', foreColor: '#adb0bb', toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
      xaxis: { categories: trend.map((d) => d.date), axisBorder: { show: false } },
      yaxis: { labels: { formatter: (v: number) => v.toString() } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(0,0,0,0.07)', strokeDashArray: 3 },
      legend: { show: true, position: 'top' },
      tooltip: { theme: 'light' },
    };
    this.riskChart = {
      series: [{
        name: 'Consultas previstas',
        data: [kpi.expected_consultations.malaria, kpi.expected_consultations.heat, kpi.expected_consultations.diarrhea, kpi.expected_consultations.respiratory],
      }],
      chart: { type: 'bar', height: 220, fontFamily: 'inherit', foreColor: '#adb0bb', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 } },
      xaxis: { categories: ['Malária', 'Calor', 'Diarreia', 'Respiratório'], axisBorder: { show: false } },
      yaxis: { labels: { formatter: (v: number) => v.toString() } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(0,0,0,0.07)', strokeDashArray: 3 },
      legend: { show: false },
      tooltip: { theme: 'light', y: { formatter: (v: number) => `${v} consultas` } },
    };
  }

  getRiskLevelColor(level: string): string {
    const colors: Record<string, string> = {
      critical: '#C0392B', high: '#E67E22', medium: '#F1C40F', low: '#27AE60',
    };
    return colors[level] ?? '#999';
  }

  getAlertStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      delivered: 'check_circle', sent: 'schedule', pending: 'hourglass_empty', failed: 'error', cancelled: 'block',
    };
    return icons[status] ?? 'help';
  }

  getAlertStatusColor(status: string): string {
    const colors: Record<string, string> = {
      delivered: 'text-green-600', sent: 'text-blue-600', pending: 'text-yellow-600', failed: 'text-red-600', cancelled: 'text-gray-500',
    };
    return colors[status] ?? 'text-gray-500';
  }
}
