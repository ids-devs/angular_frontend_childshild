import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SymptomReportsService } from '../shared/symptom-reports.service';
import { SkeletonTableComponent } from '../../shared/components/skeleton/skeleton-table.component';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { FilterOptions, SymptomReport } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-symptom-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, SkeletonTableComponent],
  templateUrl: './symptom-reports-list.component.html',
})
export class SymptomReportsListComponent implements OnInit {
  private service = inject(SymptomReportsService);
  private toast = inject(ClinicToastService);
  ctx = inject(ClinicContextService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  reports = signal<SymptomReport[]>([]);
  total = signal(0);
  displayedColumns = ['phone', 'symptoms', 'location', 'channel', 'date', 'status', 'actions'];

  filters: FilterOptions = { page: 1, per_page: 10 };
  search = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedLocality = '';
  selectedStatus = '';

  provinces: string[] = [];
  districts = signal<string[]>([]);
  localities = signal<string[]>([]);

  symptomLabels: Record<string, string> = {
    fever: 'Febre', diarrhea: 'Diarreia', cough: 'Tosse',
    vomiting: 'Vómitos', rash: 'Erupção Cutânea', other: 'Outro',
  };
  symptomColors: Record<string, string> = {
    fever: 'bg-red-100 text-red-700', diarrhea: 'bg-orange-100 text-orange-700',
    cough: 'bg-blue-100 text-blue-700', vomiting: 'bg-yellow-100 text-yellow-700',
    rash: 'bg-purple-100 text-purple-700', other: 'bg-gray-100 text-gray-600',
  };

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getSymptomReports({
      ...this.filters,
      search: this.search || undefined,
      province: this.selectedProvince || undefined,
      district: this.selectedDistrict || undefined,
      locality: this.selectedLocality || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe((res) => {
      this.reports.set(res.data);
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
    this.selectedStatus = '';
    this.districts.set([]);
    this.localities.set([]);
    this.filters = { page: 1, per_page: 10 };
    this.load();
  }

  markReviewed(report: SymptomReport): void {
    this.service.markReviewed(report.id).subscribe(() => {
      this.toast.success(`Reporte #${report.id} marcado como revisto.`);
      this.load();
    });
  }

  getSymptomColor(symptom: string): string {
    return this.symptomColors[symptom] ?? 'bg-gray-100 text-gray-600';
  }
}
