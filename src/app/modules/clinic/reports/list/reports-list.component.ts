import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { ReportsService } from '../shared/reports.service';
import { SkeletonTableComponent } from '../../shared/components/skeleton/skeleton-table.component';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { FilterOptions, Report } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, SkeletonTableComponent],
  templateUrl: './reports-list.component.html',
})
export class ReportsListComponent implements OnInit {
  private service = inject(ReportsService);
  private toast = inject(ClinicToastService);
  ctx = inject(ClinicContextService);

  loading = signal(true);
  reports = signal<Report[]>([]);
  total = signal(0);
  displayedColumns = ['name', 'type', 'period', 'province', 'status', 'stats', 'actions'];

  filters: FilterOptions = { page: 1, per_page: 10 };
  search = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedStatus = '';

  provinces: string[] = [];
  districts = signal<string[]>([]);

  reportTypeLabels: Record<string, string> = { weekly: 'Semanal', monthly: 'Mensal', custom: 'Personalizado' };
  statusLabels: Record<string, string> = { ready: 'Pronto', generating: 'A gerar...', failed: 'Falhou' };

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getReports({
      ...this.filters,
      search: this.search || undefined,
      province: this.selectedProvince || undefined,
      district: this.selectedDistrict || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe((res) => {
      this.reports.set(res.data);
      this.total.set(res.total);
      this.loading.set(false);
    });
  }

  onProvinceChange(): void {
    this.selectedDistrict = '';
    this.districts.set(this.selectedProvince ? this.service.getDistricts(this.selectedProvince) : []);
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
    this.selectedStatus = '';
    this.districts.set([]);
    this.filters = { page: 1, per_page: 10 };
    this.load();
  }

  downloadReport(report: Report): void {
    if (report.status !== 'ready') return;
    this.toast.info(`A iniciar download: ${report.name}`);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      ready: 'bg-green-100 text-green-700', generating: 'bg-blue-100 text-blue-700', failed: 'bg-red-100 text-red-700',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-700';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = { ready: 'check_circle', generating: 'hourglass_top', failed: 'error' };
    return icons[status] ?? 'help';
  }

  getFormatIcon(format: string): string {
    return format === 'pdf' ? 'picture_as_pdf' : 'grid_on';
  }
}
