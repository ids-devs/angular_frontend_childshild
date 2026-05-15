import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, catchError, shareReplay } from 'rxjs';
import { UserService } from 'src/app/core/auth/services/user.service';
import { ConfigService } from 'src/app/core/services/config.service';

export type ClinicUserRole = 'ong' | 'clinic';

export interface AssignedScope {
  province: string;
  district: string;
  locality?: string;
}

export interface ClinicUserContext {
  role: ClinicUserRole;
  organizationName: string;
  assignedScope: AssignedScope | null;
  assignedLocationId?: number | null;
}

const ONG_CONTEXT: ClinicUserContext = {
  role: 'ong',
  organizationName: 'ChildShield ONG Nacional',
  assignedScope: null,
  assignedLocationId: null,
};

const CLINIC_CONTEXT: ClinicUserContext = {
  role: 'clinic',
  organizationName: 'Centro de Saúde de Beira',
  assignedScope: { province: 'Sofala', district: 'Beira', locality: 'Munhava' },
  assignedLocationId: null,
};

@Injectable({ providedIn: 'root' })
export class ClinicContextService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private _context = signal<ClinicUserContext>(ONG_CONTEXT);
  private _locations = signal<Array<{ province: string; district: string; locality?: string }>>([]);
  private locationsLoaded = false;
  private locationsLoad$?: Observable<Array<{ province: string; district: string; locality?: string }>>;

  constructor(private userService: UserService) {
    this.userService.user$.subscribe((user) => {
      if (!user?.organization_type) return;

      const role: ClinicUserRole = user.organization_type === 'clinic' ? 'clinic' : 'ong';
      const scope = user.location
        ? {
            province: user.location.province,
            district: user.location.district,
            locality: undefined,
          }
        : null;

      this._context.set({
        role,
        organizationName: user.organization_name || user.name,
        assignedScope: role === 'clinic' ? scope : null,
        assignedLocationId: role === 'clinic' ? user.location?.id ?? null : null,
      });
    });
  }

  readonly context = this._context.asReadonly();
  readonly isOng = computed(() => this._context().role === 'ong');
  readonly isClinic = computed(() => this._context().role === 'clinic');
  readonly organizationName = computed(() => this._context().organizationName);

  readonly scopeFilter = computed((): { province?: string; district?: string; locality?: string } => {
    const scope = this._context().assignedScope;
    if (!scope) return {};
    return { province: scope.province, district: scope.district, locality: scope.locality };
  });

  readonly scopeLabel = computed(() => {
    const scope = this._context().assignedScope;
    if (!scope) return 'Visão Global';
    return scope.locality ? `${scope.locality}, ${scope.district} (${scope.province})` : `${scope.district}, ${scope.province}`;
  });
  readonly scopeLocationId = computed(() => this._context().assignedLocationId ?? undefined);

  switchToOng(): void {}

  switchToClinic(): void {}

  loadLocationHierarchy(): Observable<void> {
    if (this.locationsLoaded) return of(void 0);
    if (!this.locationsLoad$) {
      this.locationsLoad$ = this.http.get<any>(this.config.getApiUrl('v1/locations')).pipe(
        map((response) =>
          (response.data ?? []).map((location: any) => ({
            province: location.province?.name ?? '',
            district: location.district?.name ?? '',
            locality: location.locality ?? undefined,
          }))
        ),
        tap((locations) => {
          this._locations.set(locations);
          this.locationsLoaded = true;
        }),
        catchError(() => {
          this._locations.set([]);
          this.locationsLoaded = true;
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.locationsLoad$.pipe(map(() => void 0));
  }

  getProvinces(): string[] {
    return [...new Set(this._locations().map((l) => l.province).filter(Boolean))].sort();
  }

  getDistricts(province: string): string[] {
    return [...new Set(this._locations().filter((l) => l.province === province).map((l) => l.district).filter(Boolean))].sort();
  }

  getLocalities(province: string, district: string): string[] {
    return this._locations().filter((l) => l.province === province && l.district === district)
      .map((l) => l.locality)
      .filter((l): l is string => !!l)
      .sort();
  }
}
