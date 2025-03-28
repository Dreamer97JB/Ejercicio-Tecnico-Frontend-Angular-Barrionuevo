import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../core/services/product.service';
import { of, throwError } from 'rxjs';
import { FinancialProduct } from '../../../core/models/financial-product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: jest.Mocked<ProductService>;


  const mockProducts: FinancialProduct[] = [
    {
      id: 'inv-fondo7',
      name: 'Fondo de Inversión Segura7',
      description: 'Fondo diversificado de bajo riesgo para inversión a largo plazo',
      logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-platinum-400x225.jpg',
      date_release: new Date('2024-01-15'),
      date_revision: new Date('2025-01-15'),
    },
    {
      id: 'inv-fondo8',
      name: 'Fondo de Inversión Tech8',
      description: 'Fondo diversificado de alto riesgo para inversión tecnológica',
      logo: '',
      date_release: new Date('2024-03-01'),
      date_revision: new Date('2025-03-01'),
    },
  ];

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      createProduct: jest.fn(),
      verifyId: jest.fn(),
      baseUrl: '',
      http: {} as unknown
    } as unknown as jest.Mocked<ProductService>;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, CommonModule, FormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(component.allProducts.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should filter products by name', () => {
    component.filterTerm = 'Tech8';
    component.onSearchChange();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('inv-fondo8');
  });

  it('should return paginated products correctly', () => {
    component.pageSize = 1;
    component.currentPage = 2;
    const result = component.paginatedProducts;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('inv-fondo8');
  });

  it('should handle empty search', () => {
    component.filterTerm = '';
    component.onSearchChange();
    expect(component.filteredProducts.length).toBe(2);
  });

  it('should set currentPage to 1 on page size change', () => {
    component.currentPage = 5;
    component.onPageSizeChange();
    expect(component.currentPage).toBe(1);
  });

  it('should show total results', () => {
    expect(component.totalResults).toBe(2);
  });

  it('should handle service error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    productServiceMock.getProducts!.mockReturnValueOnce(throwError(() => new Error('error')));

    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading products', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
