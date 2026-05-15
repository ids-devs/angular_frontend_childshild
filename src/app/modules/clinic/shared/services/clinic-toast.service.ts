import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ClinicToastService {
  private snackBar = inject(MatSnackBar);

  private show(message: string, panelClass: string, duration = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass],
    };
    this.snackBar.open(message, 'Fechar', config);
  }

  success(message: string): void {
    this.show(message, 'snackbar-success');
  }

  error(message: string): void {
    this.show(message, 'snackbar-error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'snackbar-warning');
  }

  info(message: string): void {
    this.show(message, 'snackbar-info');
  }
}
