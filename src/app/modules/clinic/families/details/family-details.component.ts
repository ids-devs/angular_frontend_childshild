import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FamiliesService } from '../shared/families.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { Household } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-family-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, SkeletonCardComponent],
  templateUrl: './family-details.component.html',
})
export class FamilyDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(FamiliesService);

  loading = signal(true);
  family = signal<Household | null>(null);
  notFound = signal(false);

  languageLabels: Record<string, string> = {
    pt: 'Português',
    changane: 'Changane',
    sena: 'Sena',
    macua: 'Macua',
    ndau: 'Ndau',
  };

  channelLabels: Record<string, string> = {
    ussd: 'USSD (*123#)',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
  };

  ageGroupLabels: Record<string, string> = {
    '0-1': 'Menos de 1 ano',
    '1-5': '1 a 5 anos',
    '6-12': '6 a 12 anos',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getFamilyById(id).subscribe((family) => {
      if (!family) {
        this.notFound.set(true);
      } else {
        this.family.set(family);
      }
      this.loading.set(false);
    });
  }

  getVulnerabilityColor(score: number): string {
    if (score >= 80) return '#C0392B';
    if (score >= 60) return '#E67E22';
    if (score >= 40) return '#F1C40F';
    return '#27AE60';
  }

  getVulnerabilityLabel(score: number): string {
    if (score >= 80) return 'Muito Alto';
    if (score >= 60) return 'Alto';
    if (score >= 40) return 'Médio';
    return 'Baixo';
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
