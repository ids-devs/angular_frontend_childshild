import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ReportsService } from '../shared/reports.service';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { Report, ReportFormat, ReportType } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule, SkeletonCardComponent],
  templateUrl: './report-details.component.html',
})
export class ReportDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private service = inject(ReportsService);
  private toast = inject(ClinicToastService);
  private ctx = inject(ClinicContextService);

  loading = signal(true);
  saving = signal(false);
  isNewMode = signal(false);
  report = signal<Report | null>(null);

  form!: FormGroup;
  provinces: string[] = [];

  reportTypeLabels: Record<string, string> = { weekly: 'Semanal', monthly: 'Mensal', custom: 'Personalizado' };
  statusLabels: Record<string, string> = { ready: 'Pronto', generating: 'A gerar...', failed: 'Falhou' };

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
    });
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    const isNewPath = this.route.snapshot.url.some((segment) => segment.path === 'new');
    if (id === 'new' || isNewPath) {
      this.isNewMode.set(true);
      this.loading.set(false);
    } else {
      this.service.getReportById(Number(id)).subscribe((r) => {
        if (r) this.report.set(r);
        this.loading.set(false);
      });
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      province: ['', Validators.required],
      district: [''],
      report_type: ['monthly' as ReportType, Validators.required],
      format: ['pdf' as ReportFormat, Validators.required],
      period_start: [today, Validators.required],
      period_end: [today, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }
    this.saving.set(true);
    this.service.generateReport(this.form.value).subscribe(() => {
      this.saving.set(false);
      this.toast.success('Relatório em geração! Ficará disponível em breve.');
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  downloadReport(): void {
    this.toast.info(`A iniciar download: ${this.report()?.name}`);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      ready: 'bg-green-100 text-green-700',
      generating: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-700';
  }
}
