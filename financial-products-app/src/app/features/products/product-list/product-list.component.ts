import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { FinancialProduct } from '../../../core/models/financial-product.model';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  allProducts: FinancialProduct[] = [];
  filteredProducts: FinancialProduct[] = [];
  loading = true;

  //búsqueda de producto
  filterTerm: string = '';

  //paginación
  pageSize: number = 5;
  currentPage: number = 1;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.filteredProducts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    const term = this.filterTerm.toLowerCase();
    this.filteredProducts = this.allProducts.filter((product) =>
      product.name.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  get paginatedProducts(): FinancialProduct[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProducts.slice(start, end);
  }

  get totalResults(): number {
    return this.filteredProducts.length;
  }

}
