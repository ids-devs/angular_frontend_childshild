import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from '../../material.module';
import { ConfigService } from 'src/app/core/services/config.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-starter',
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  loading = signal(true);
  overview = signal<any>(null);
  riskMap = signal<any[]>([]);
  alerts = signal<any[]>([]);

  ngOnInit(): void {
    this.http.get<any>(this.config.getApiUrl('v1/dashboard/overview')).subscribe((res) => {
      this.overview.set(res.data ?? {});
    });
    this.http.get<any>(this.config.getApiUrl('v1/dashboard/risk-map')).subscribe((res) => {
      this.riskMap.set(res.data ?? []);
    });
    this.http.get<any>(this.config.getApiUrl('v1/alerts'), { params: { per_page: '5' } }).subscribe((res) => {
      this.alerts.set(res.data ?? []);
      this.loading.set(false);
    });
  }
}
