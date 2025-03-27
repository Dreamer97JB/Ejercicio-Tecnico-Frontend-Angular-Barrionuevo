import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ApiError } from '../../../core/models/api-error.model';
import { catchError, debounceTime, map, of, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      id: [
        '',
        {
          validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
          asyncValidators: [this.uniqueIdValidator()],
          updateOn: 'blur'
        }
      ],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.minTodayValidator]],
      date_revision: [
        { value: '', disabled: true },
        [Validators.required, this.matchOneYearAfterRelease()]
      ],
    });

    this.productForm.get('date_release')?.valueChanges.subscribe((releaseDate: string) => {
      if (!releaseDate) {
        this.productForm.get('date_revision')?.setValue('');
        return;
      }

      const [year, month, day] = releaseDate.split('-').map(Number);
      const revisionDate = new Date(year + 1, month - 1, day);
      const revisionStr = revisionDate.toISOString().split('T')[0];

      this.productForm.get('date_revision')?.setValue(revisionStr);
      this.productForm.get('date_revision')?.markAsTouched(); // Optional
    });

  }

  minTodayValidator(control: AbstractControl) {
    if (!control.value) return null;

    const [year, month, day] = control.value.split('-').map(Number);
    const inputYMD = new Date(year, month - 1, day);

    const today = new Date();
    const todayYMD = new Date(today.getFullYear(), today.getMonth(), today.getDate());


    return inputYMD >= todayYMD ? null : { minDate: true };
  }


  matchOneYearAfterRelease() {
    return (control: AbstractControl) => {
      if (!control.parent) return null;

      const releaseDate = control.parent.get('date_release')?.value;
      const revisionDate = control.value;

      if (!releaseDate || !revisionDate) return null;

      const [ry, rm, rd] = releaseDate.split('-').map(Number);
      const expected = new Date(ry + 1, rm - 1, rd);

      const [vy, vm, vd] = revisionDate.split('-').map(Number);
      const actual = new Date(vy, vm - 1, vd);

      return actual.getTime() === expected.getTime()
        ? null
        : { notOneYearAfter: true };
    };
  }

  uniqueIdValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(300),
        switchMap((id: string) =>
          this.productService.verifyId(id).pipe(
            map((exists: boolean) => (exists ? { idTaken: true } : null)),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.value;
    this.productService.createProduct(product).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: ApiError) => alert('Error al agregar producto: ' + err.message)
    });
  }

  onReset() {
    this.productForm.reset();
  }
}
