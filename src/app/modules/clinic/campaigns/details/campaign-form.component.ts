import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CampaignsService } from '../shared/campaigns.service';
import { ClinicToastService } from '../../shared/services/clinic-toast.service';
import { ClinicContextService } from '../../shared/services/clinic-context.service';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';
import { Campaign, RiskType } from '../../shared/types/clinic.types';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule, SkeletonCardComponent],
  templateUrl: './campaign-form.component.html',
})
export class CampaignFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private service = inject(CampaignsService);
  private toast = inject(ClinicToastService);
  private ctx = inject(ClinicContextService);

  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  campaign = signal<Campaign | null>(null);

  form!: FormGroup;

  provinces: string[] = [];
  riskTypes: RiskType[] = [];

  riskTypeLabels: Record<string, string> = {
    heat: 'Calor Extremo',
    malaria: 'Malária',
    diarrhea: 'Diarreia',
    respiratory: 'Respiratório',
  };

  messageMaxLength = 160;

  ngOnInit(): void {
    this.ctx.loadLocationHierarchy().subscribe(() => {
      this.provinces = this.service.getProvinces();
    });
    this.riskTypes = this.service.getRiskTypes();
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.service.getCampaignById(Number(id)).subscribe((c) => {
        if (c) {
          this.campaign.set(c);
          this.form.patchValue(c);
        }
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.maxLength(this.messageMaxLength)]],
      province: ['', Validators.required],
      district: ['', Validators.required],
      zone: [''],
      risk_type: ['malaria', Validators.required],
      status: ['draft'],
      scheduled_at: [''],
      created_by: ['Dr. Ana Silva'],
      total_recipients: [0],
    });
  }

  get messageLength(): number {
    return this.form.get('message')?.value?.length ?? 0;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    this.saving.set(true);
    const payload = { ...this.form.value };
    if (!payload.zone) payload.zone = payload.province;

    this.service.createCampaign(payload).subscribe(() => {
      this.saving.set(false);
      this.toast.success('Campanha criada com sucesso!');
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;
    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    return null;
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
