import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ClinicContextService } from '../../services/clinic-context.service';

@Component({
  selector: 'app-clinic-role-switcher',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
         [ngClass]="ctx.isOng() ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-teal-50 border-teal-200 text-teal-700'">
      <mat-icon class="text-base! leading-none">{{ ctx.isOng() ? 'public' : 'location_city' }}</mat-icon>
      <span>{{ ctx.organizationName() }}</span>
      <span class="text-gray-300 mx-0.5">|</span>
      <span class="italic opacity-70">{{ ctx.isOng() ? 'ONG' : 'Clínica' }}</span>
    </div>
  `,
})
export class ClinicRoleSwitcherComponent {
  ctx = inject(ClinicContextService);
}
