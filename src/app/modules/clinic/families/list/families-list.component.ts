import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { FamiliesService } from '../shared/families.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton/skeleton-table.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { FilterOptions, Household } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-families-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, SkeletonCardComponent, SkeletonTableComponent, StatCardComponent],
  templateUrl: './families-list.component.html',
})
export class FamiliesListComponent implements OnInit {
  private service = inject(FamiliesService);
  ctx = inject(ClinicContextService);

  loading = signal(true);
  statsLoading = signal(true);
  families = signal<Household[]>([]);
  total = signal(0);
  stats = signal<{ total: number; active: number; high_vulnerability: number; with_pregnant: number } | null>(null);

  displayedColumns = ['phone', 'location', 'children', 'vulnerability', 'channel', 'subscription', 'created_at', 'actions'];

  filters: FilterOptions = { page: 1, per_page: 10 };
  search = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedLocality = '';
  selectedStatus = '';

  provinces: string[] = [];
  districts = signal<string[]>([]);
  localities = signal<string[]>([]);

  channelLabels: Record<string, string> = { ussd: 'USSD', sms: 'SMS', whatsapp: 'WhatsApp' };

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
    });
    this.service.getStats().subscribe((s) => {
      this.stats.set(s);
      this.statsLoading.set(false);
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getFamilies({
      ...this.filters,
      search: this.search || undefined,
      province: this.selectedProvince || undefined,
      district: this.selectedDistrict || undefined,
      locality: this.selectedLocality || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe((res) => {
      this.families.set(res.data);
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
    this.selectedStatus = '';
    this.districts.set([]);
    this.localities.set([]);
    this.filters = { page: 1, per_page: 10 };
    this.load();
  }

  getVulnerabilityClass(score: number): string {
    if (score >= 80) return 'text-red-700 font-bold';
    if (score >= 60) return 'text-orange-600 font-semibold';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  }

  getVulnerabilityLabel(score: number): string {
    if (score >= 80) return 'Muito Alto';
    if (score >= 60) return 'Alto';
    if (score >= 40) return 'Médio';
    return 'Baixo';
  }

  getAgeGroupLabel(group: string): string {
    const labels: Record<string, string> = { '0-1': '< 1 ano', '1-5': '1–5 anos', '6-12': '6–12 anos' };
    return labels[group] ?? group;
  }
}
