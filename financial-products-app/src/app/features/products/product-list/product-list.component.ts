import {
  Component,
  OnInit,
  HostListener,
  ViewChildren,
  ElementRef,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { FinancialProduct } from '../../../core/models/financial-product.model';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDeleteModalComponent } from "../../../shared/components/confirm-delete-modal.component";

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDeleteModalComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  allProducts: FinancialProduct[] = [];
  filteredProducts: FinancialProduct[] = [];
  loading = true;

  //modal de borrado
  selectedProductId: string | null = null;
  selectedProductName: string | null = null;
  showDeleteModal = false;

  // búsqueda de producto
  filterTerm = '';

  // paginación
  pageSize = 5;
  currentPage = 1;

  // contextual menu
  menuOpenId: string | null = null;
  @ViewChildren('menuRef') menus!: QueryList<ElementRef>;

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }

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

  toggleMenu(id: string): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  isMenuOpen(id: string): boolean {
    return this.menuOpenId === id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = this.menus?.some((menu) =>
      menu.nativeElement.contains(target)
    );

    const clickedToggle = target.closest('button');

    if (!clickedInside && !clickedToggle) {
      this.menuOpenId = null;
    }
  }

  onEdit(id: string): void {
    this.menuOpenId = null;
    this.router.navigate(['/editar', id]);
  }

  onDelete(id: string, name: string): void {
    this.menuOpenId = null;
    this.selectedProductId = id;
    this.selectedProductName = name;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedProductId) return;
    this.productService.deleteProduct(this.selectedProductId).subscribe({
      next: () => {
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== this.selectedProductId);
        this.allProducts = this.allProducts.filter(p => p.id !== this.selectedProductId);
        this.showDeleteModal = false;
        this.menuOpenId = null;
      },
      error: (err) => {
        alert('Error eliminando producto: ' + err.message);
      }
    });
  }


  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedProductId = null;
    this.selectedProductName = null;
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
