import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl p-4 shadow-sm animate-pulse" [ngStyle]="{ height: height }">
      <div class="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div class="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  `,
})
export class SkeletonCardComponent {
  @Input() height = '120px';
}
