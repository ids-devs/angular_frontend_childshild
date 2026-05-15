import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel, RiskType } from '../../types/clinic.types';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" [ngClass]="badgeClass">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class RiskBadgeComponent {
  @Input() level!: RiskLevel;
  @Input() type?: RiskType;
  @Input() showType = false;

  get label(): string {
    const typeLabel = this.showType && this.type ? ` — ${this.typeLabel}` : '';
    return `${this.levelLabel}${typeLabel}`;
  }

  get levelLabel(): string {
    const labels: Record<RiskLevel, string> = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto',
      critical: 'Crítico',
    };
    return labels[this.level] ?? this.level;
  }

  get typeLabel(): string {
    const labels: Record<RiskType, string> = {
      heat: 'Calor',
      malaria: 'Malária',
      diarrhea: 'Diarreia',
      respiratory: 'Respiratório',
    };
    return this.type ? labels[this.type] : '';
  }

  get badgeClass(): string {
    const classes: Record<RiskLevel, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return classes[this.level] ?? 'bg-gray-100 text-gray-800';
  }

  get dotClass(): string {
    const classes: Record<RiskLevel, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return classes[this.level] ?? 'bg-gray-500';
  }
}
