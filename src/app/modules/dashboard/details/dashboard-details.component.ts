import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { DashboardService } from '../shared/dashboard.service';

@Component({
  selector: 'app-dashboard-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './dashboard-details.component.html',
})
export class DashboardDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(DashboardService);

  loading = signal(true);
  alert = signal<any>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getAlertById(id).subscribe((response) => {
      this.alert.set(response.data ?? null);
      this.loading.set(false);
    });
  }
}
