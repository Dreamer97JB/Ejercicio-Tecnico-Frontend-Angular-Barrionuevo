import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'add', component: ProductFormComponent },
  { path: 'editar/:id', loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
  }
];
