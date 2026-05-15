import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { SymptomReportsService } from '../shared/symptom-reports.service';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { SymptomReport } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-symptom-report-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, SkeletonCardComponent],
  templateUrl: './symptom-report-details.component.html',
})
export class SymptomReportDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(SymptomReportsService);
  private toast = inject(ClinicToastService);

  loading = signal(true);
  saving = signal(false);
  report = signal<SymptomReport | null>(null);

  symptomLabels: Record<string, string> = {
    fever: 'Febre',
    diarrhea: 'Diarreia',
    cough: 'Tosse',
    vomiting: 'Vómitos',
    rash: 'Erupção Cutânea',
    other: 'Outro',
  };

  symptomColors: Record<string, string> = {
    fever: 'bg-red-100 text-red-700',
    diarrhea: 'bg-orange-100 text-orange-700',
    cough: 'bg-blue-100 text-blue-700',
    vomiting: 'bg-yellow-100 text-yellow-700',
    rash: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-600',
  };

  channelIcons: Record<string, string> = {
    whatsapp: 'chat',
    sms: 'sms',
    ussd: 'dialpad',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe((r) => {
      if (r) this.report.set(r);
      else this.toast.error('Reporte não encontrado.');
      this.loading.set(false);
    });
  }

  markReviewed(): void {
    if (!this.report() || this.report()!.reviewed) return;
    this.saving.set(true);
    this.service.markReviewed(this.report()!.id).subscribe(() => {
      this.saving.set(false);
      this.toast.success('Reporte marcado como revisto.');
      this.report.update((r) => r ? { ...r, reviewed: true } : r);
    });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getSymptomColor(symptom: string): string {
    return this.symptomColors[symptom] ?? 'bg-gray-100 text-gray-600';
  }
}
