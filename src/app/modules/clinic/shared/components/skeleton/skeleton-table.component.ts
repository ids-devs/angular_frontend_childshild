import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse">
      <div class="h-10 bg-gray-200 rounded mb-2"></div>
      @for (row of rows; track $index) {
        <div class="h-12 rounded mb-1" [ngClass]="$index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'"></div>
      }
    </div>
  `,
})
export class SkeletonTableComponent {
  @Input() rowCount = 5;

  get rows(): number[] {
    return Array(this.rowCount).fill(0);
  }
}
