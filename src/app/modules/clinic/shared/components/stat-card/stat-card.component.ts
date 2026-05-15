import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type StatCardColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stat-card h-full">
      <mat-card-content class="p-4 h-full">
        @if (loading) {
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        } @else {
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-500 font-medium truncate mb-1">{{ title }}</p>
              <p class="text-2xl font-bold" [ngClass]="valueColorClass">{{ value }}</p>
              @if (subtitle) {
                <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
              }
              @if (trend !== undefined) {
                <div class="flex items-center gap-1 mt-2">
                  <span class="text-xs font-semibold" [ngClass]="trend >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ trend >= 0 ? '▲' : '▼' }} {{ trend | number:'1.1-1' }}%
                  </span>
                  <span class="text-xs text-gray-400">vs semana anterior</span>
                </div>
              }
            </div>
            <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" [ngClass]="iconBgClass">
              <mat-icon class="text-xl!" [ngClass]="iconColorClass">{{ icon }}</mat-icon>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number | null = '';
  @Input() subtitle?: string;
  @Input() icon = 'info';
  @Input() color: StatCardColor = 'primary';
  @Input() trend?: number;
  @Input() loading = false;

  get iconBgClass(): string {
    const classes: Record<StatCardColor, string> = {
      primary: 'bg-blue-100',
      success: 'bg-green-100',
      warning: 'bg-orange-100',
      error: 'bg-red-100',
      info: 'bg-purple-100',
    };
    return classes[this.color];
  }

  get iconColorClass(): string {
    const classes: Record<StatCardColor, string> = {
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-orange-600',
      error: 'text-red-600',
      info: 'text-purple-600',
    };
    return classes[this.color];
  }

  get valueColorClass(): string {
    const classes: Record<StatCardColor, string> = {
      primary: 'text-blue-700',
      success: 'text-green-700',
      warning: 'text-orange-700',
      error: 'text-red-700',
      info: 'text-purple-700',
    };
    return classes[this.color];
  }
}
