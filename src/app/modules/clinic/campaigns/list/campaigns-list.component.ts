import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CampaignsService } from '../shared/campaigns.service';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton/skeleton-table.component';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { Campaign, FilterOptions } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-campaigns-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, RiskBadgeComponent, SkeletonTableComponent],
  templateUrl: './campaigns-list.component.html',
})
export class CampaignsListComponent implements OnInit {
  private service = inject(CampaignsService);
  private toast = inject(ClinicToastService);
  ctx = inject(ClinicContextService);

  loading = signal(true);
  campaigns = signal<Campaign[]>([]);
  total = signal(0);
  displayedColumns = ['name', 'risk', 'zone', 'status', 'recipients', 'delivery', 'created_at', 'actions'];

  filters: FilterOptions = { page: 1, per_page: 10 };
  search = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedStatus = '';
  selectedRiskType = '';

  provinces: string[] = [];
  districts = signal<string[]>([]);

  riskTypeLabels: Record<string, string> = {
    heat: 'Calor', malaria: 'Malária', diarrhea: 'Diarreia', respiratory: 'Respiratório',
  };
  statusLabels: Record<string, string> = {
    draft: 'Rascunho', scheduled: 'Agendada', sent: 'Enviada', failed: 'Falhou', cancelled: 'Cancelada',
  };
  statusOptions = ['draft', 'scheduled', 'sent', 'failed', 'cancelled'];

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getCampaigns({
      ...this.filters,
      search: this.search || undefined,
      province: this.selectedProvince || undefined,
      district: this.selectedDistrict || undefined,
      status: this.selectedStatus || undefined,
      risk_type: (this.selectedRiskType as any) || undefined,
    }).subscribe((res) => {
      this.campaigns.set(res.data);
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
    this.selectedRiskType = '';
    this.districts.set([]);
    this.filters = { page: 1, per_page: 10 };
    this.load();
  }

  sendNow(campaign: Campaign): void {
    this.toast.info('A API atual não expõe endpoint para envio imediato. Use o agendamento ao criar a campanha.');
  }

  getDeliveryRate(c: Campaign): number {
    if (!c.total_recipients) return 0;
    return Math.round((c.delivered / c.total_recipients) * 100);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700', scheduled: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', cancelled: 'bg-gray-200 text-gray-700',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-700';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: 'edit_note', scheduled: 'schedule_send', sent: 'check_circle', failed: 'error', cancelled: 'block',
    };
    return icons[status] ?? 'help';
  }
}
