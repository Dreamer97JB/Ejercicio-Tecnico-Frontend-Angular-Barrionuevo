import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { SnackbarService } from '../../../core/services/snackbar.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceMock: jest.Mocked<ProductService>;
  let routerMock: jest.Mocked<Router>;
  let snackbarServiceMock: jest.Mocked<SnackbarService>;
  let activatedRouteMock: Partial<ActivatedRoute>;

  beforeEach(async () => {
    productServiceMock = {
      verifyId: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn().mockReturnValue(of({})),
      updateProduct: jest.fn().mockReturnValue(of({})),
      getProductById: jest.fn().mockReturnValue(of({
        id: 'prod-01',
        name: 'Producto existente',
        description: 'Descripción editada',
        logo: 'http://img.png',
        date_release: new Date('2024-01-01'),
        date_revision: new Date('2025-01-01'),
      })),
    } as unknown as jest.Mocked<ProductService>;

    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    snackbarServiceMock = {
      show: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null),
          has: () => false,
          getAll: () => [],
          keys: [],
        },
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        data: {},
        outlet: '',
        component: null,
        routeConfig: null,
        title: undefined,
        root: new ActivatedRouteSnapshot(),
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        queryParamMap: {
          get: () => null,
          has: () => false,
          getAll: () => [],
          keys: [],
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
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
    component.productForm.reset();
    expect(component.productForm.valid).toBeFalsy();
  });

  it('should compute revision date when release date changes', () => {
    const releaseControl = component.productForm.get('date_release');
    releaseControl?.setValue('2024-03-25');
    const revisionValue = component.productForm.get('date_revision')?.value;
    expect(revisionValue).toBe('2025-03-25');
  });

  it('should validate minTodayValidator correctly', () => {
    const validator = component.minTodayValidator;
    const pastDate = new FormControl('2000-01-01');
    const futureDate = new FormControl('2999-12-31');
    expect(validator(pastDate)).toEqual({ minDate: true });
    expect(validator(futureDate)).toBeNull();
  });

  it('should validate matchOneYearAfterRelease correctly', () => {
    const formGroup = new FormGroup({
      date_release: new FormControl('2024-03-25'),
      date_revision: new FormControl('2025-03-25')
    });

    const validator = component.matchOneYearAfterRelease();
    const result = validator(formGroup.get('date_revision')!);
    expect(result).toBeNull(); // válido
  });


  it('should call createProduct and navigate on valid form submission', async () => {
    component.productForm.setValue({
      id: 'valid-id',
      name: 'Valid Name',
      description: 'Valid product description',
      logo: 'http://logo.png',
      date_release: '2024-03-25',
      date_revision: '2025-03-25',
    });
    await fixture.whenStable();
    expect(component.productForm.valid).toBe(true);
    component.onSubmit();
    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(snackbarServiceMock.show).toHaveBeenCalledWith('Producto creado correctamente', 'success');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show snackbar on submission error (create)', () => {
    productServiceMock.createProduct.mockReturnValueOnce(throwError(() => ({ message: 'Falló' })));
    component.productForm.setValue({
      id: 'valid-id',
      name: 'Valid Name',
      description: 'Valid product description',
      logo: 'http://logo.png',
      date_release: '2024-03-25',
      date_revision: '2025-03-25',
    });
    component.onSubmit();
    expect(snackbarServiceMock.show).toHaveBeenCalledWith('Error al guardar producto: Falló', 'error');
  });

  it('should not submit when form is invalid', () => {
    component.productForm.patchValue({ name: '' });
    component.onSubmit();
    expect(productServiceMock.createProduct).not.toHaveBeenCalled();
    expect(productServiceMock.updateProduct).not.toHaveBeenCalled();
  });

  it('should load product and call updateProduct in edit mode', () => {
    const id = 'prod-01';
    (activatedRouteMock.snapshot!.paramMap.get as jest.Mock).mockReturnValue(id);
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(productServiceMock.getProductById).toHaveBeenCalledWith('prod-01');

    component.productForm.enable();
    component.onSubmit();

    expect(productServiceMock.updateProduct).toHaveBeenCalledWith(expect.objectContaining({ id: 'prod-01' }));
    expect(snackbarServiceMock.show).toHaveBeenCalledWith('Producto editado correctamente', 'success');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should reset the form in creation mode', () => {
    component.isEditMode = false;
    component.productForm.patchValue({ name: 'Test' });
    component.onReset();
    expect(component.productForm.value.name).toBeFalsy();
  });

  it('should navigate back in edit mode when reset is clicked', () => {
    component.isEditMode = true;
    component.onReset();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should prevent unsafe characters in logo field', () => {
    const event = new KeyboardEvent('keydown', { key: '@' });
    const preventDefault = jest.spyOn(event, 'preventDefault');
    component.preventUnsafeChars(event, 'logo');
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should allow safe characters in name field', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    const preventDefault = jest.spyOn(event, 'preventDefault');
    component.preventUnsafeChars(event, 'name');
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
