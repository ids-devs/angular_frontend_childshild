import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    document.body.classList.add('auth-login-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('auth-login-page');
  }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) return;

    this.authService.signIn({
      email: this.f['email'].value!,
      password: this.f['password'].value!,
    }).subscribe({
      next: () => {},
      error: () => {},
    });
  }
}
