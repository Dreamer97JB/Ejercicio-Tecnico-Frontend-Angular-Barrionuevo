import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../core/services/product.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';


function createControlMock(value: string): AbstractControl {
  return {
    value,
  } as AbstractControl;
}

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceMock: jest.Mocked<ProductService>;
  let routerMock: jest.Mocked<Router>;

  beforeEach(async () => {
    productServiceMock = {
      verifyId: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ProductService>;

    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the form component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form if required fields are empty', () => {
    component.productForm.setValue({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });

    expect(component.productForm.valid).toBeFalsy();
  });

  it('should compute revision date when release date changes', () => {
    const releaseControl = component.productForm.get('date_release');
    releaseControl?.setValue('2024-03-25');

    const revisionValue = component.productForm.get('date_revision')?.value;
    expect(revisionValue).toBe('2025-03-25');
  });

  it('should validate minTodayValidator correctly', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const pastDateStr = yesterday.toISOString().split('T')[0];

    const result = component.minTodayValidator(createControlMock(pastDateStr));
    expect(result).toEqual({ minDate: true });

    const todayStr = today.toISOString().split('T')[0];
    const resultToday = component.minTodayValidator(createControlMock(todayStr));
    expect(resultToday).toBeNull();
  });

  it('should call createProduct and navigate on valid form submission', () => {
    component.productForm.setValue({
      id: 'valid-id',
      name: 'Valid Product Name',
      description: 'A valid product description here.',
      logo: 'http://image.url/logo.png',
      date_release: '2024-03-25',
      date_revision: '2025-03-25',
    });

    component.onSubmit();

    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should not submit when form is invalid', () => {
    const spy = jest.spyOn(productServiceMock, 'createProduct');
    component.productForm.patchValue({ name: '' }); // invalidate form
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show alert on submission error', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    productServiceMock.createProduct.mockReturnValueOnce(throwError(() => ({ message: 'Failed' })));

    component.productForm.setValue({
      id: 'valid-id',
      name: 'Valid Product Name',
      description: 'A valid product description here.',
      logo: 'http://image.url/logo.png',
      date_release: '2024-03-25',
      date_revision: '2025-03-25',
    });

    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Error al agregar producto: Failed');
  });
});
