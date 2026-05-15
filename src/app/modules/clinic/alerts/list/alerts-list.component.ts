import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AlertsService } from '../shared/alerts.service';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton/skeleton-table.component';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { Alert, FilterOptions, RiskLevel, RiskType } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-alerts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, RiskBadgeComponent, SkeletonTableComponent],
  templateUrl: './alerts-list.component.html',
})
export class AlertsListComponent implements OnInit {
  private service = inject(AlertsService);
  private toast = inject(ClinicToastService);
  ctx = inject(ClinicContextService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  alerts = signal<Alert[]>([]);
  total = signal(0);
  displayedColumns = ['risk', 'location', 'message', 'channel', 'status', 'sent_at', 'actions'];

  filters: FilterOptions = { page: 1, per_page: 10 };
  search = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedLocality = '';
  selectedLevel: RiskLevel | '' = '';
  selectedType: RiskType | '' = '';
  selectedStatus = '';

  provinces: string[] = [];
  districts = signal<string[]>([]);
  localities = signal<string[]>([]);
  riskLevels: RiskLevel[] = [];
  riskTypes: RiskType[] = [];

  statusOptions = ['delivered', 'sent', 'pending', 'failed', 'cancelled'];

  riskTypeLabels: Record<string, string> = {
    heat: 'Calor', malaria: 'Malária', diarrhea: 'Diarreia', respiratory: 'Respiratório',
  };
  riskLevelLabels: Record<string, string> = {
    low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico',
  };
  statusLabels: Record<string, string> = {
    delivered: 'Entregue', sent: 'Enviado', pending: 'Pendente', failed: 'Falhou', cancelled: 'Cancelado',
  };

  ngOnInit(): void {
    this.riskLevels = this.service.getRiskLevels();
    this.riskTypes = this.service.getRiskTypes();
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getAlerts({
      ...this.filters,
      search: this.search || undefined,
      province: this.selectedProvince || undefined,
      district: this.selectedDistrict || undefined,
      locality: this.selectedLocality || undefined,
      risk_level: this.selectedLevel || undefined,
      risk_type: (this.selectedType as RiskType) || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe((res) => {
      this.alerts.set(res.data);
      this.total.set(res.total);
      this.loading.set(false);
    });
  }

  onProvinceChange(): void {
    this.selectedDistrict = '';
    this.selectedLocality = '';
    this.districts.set(this.selectedProvince ? this.service.getDistricts(this.selectedProvince) : []);
    this.localities.set([]);
    this.filters.page = 1;
    this.load();
  }

  onDistrictChange(): void {
    this.selectedLocality = '';
    this.localities.set(this.selectedDistrict ? this.service.getLocalities(this.selectedProvince, this.selectedDistrict) : []);
    this.filters.page = 1;
    this.load();
  }

  onSearch(): void {
    this.filters.page = 1;
    this.load();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.per_page = event.pageSize;
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.selectedProvince = '';
    this.selectedDistrict = '';
    this.selectedLocality = '';
    this.selectedLevel = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.districts.set([]);
    this.localities.set([]);
    this.filters = { page: 1, per_page: 10 };
    this.load();
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      delivered: 'check_circle', sent: 'schedule', pending: 'hourglass_empty', failed: 'error', cancelled: 'block',
    };
    return icons[status] ?? 'help';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      delivered: 'text-green-600', sent: 'text-blue-600', pending: 'text-yellow-600', failed: 'text-red-600', cancelled: 'text-gray-500',
    };
    return classes[status] ?? 'text-gray-500';
  }

  copyMessage(msg: string): void {
    navigator.clipboard.writeText(msg);
    this.toast.success('Mensagem copiada!');
  }
}
