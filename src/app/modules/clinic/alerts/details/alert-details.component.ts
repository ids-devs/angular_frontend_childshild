import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AlertsService } from '../shared/alerts.service';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { Alert } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-alert-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, RiskBadgeComponent, SkeletonCardComponent],
  templateUrl: './alert-details.component.html',
})
export class AlertDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(AlertsService);

  loading = signal(true);
  alert = signal<Alert | null>(null);
  notFound = signal(false);

  riskTypeLabels: Record<string, string> = {
    heat: 'Calor Extremo',
    malaria: 'Malária',
    diarrhea: 'Diarreia',
    respiratory: 'Doenças Respiratórias',
  };

  riskTypeDescriptions: Record<string, string> = {
    heat: 'Risco de hipertermia e desidratação infantil por exposição a calor extremo.',
    malaria: 'Proliferação de vectores após chuvas. Risco elevado de malária para crianças menores de 5 anos.',
    diarrhea: 'Contaminação de fontes de água após cheias ou chuvas fortes. Risco de gastroenterite.',
    respiratory: 'Qualidade do ar reduzida por poeira, poluição ou época seca com vento forte.',
  };

  statusLabels: Record<string, string> = {
    delivered: 'Entregue',
    sent: 'Enviado',
    pending: 'Pendente',
    failed: 'Falhou',
    cancelled: 'Cancelado',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getAlertById(id).subscribe((alert) => {
      if (!alert) {
        this.notFound.set(true);
      } else {
        this.alert.set(alert);
      }
      this.loading.set(false);
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      delivered: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-800';
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
