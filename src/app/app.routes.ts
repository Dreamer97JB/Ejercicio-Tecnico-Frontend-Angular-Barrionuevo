import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ProductListComponent },
      { path: 'add', component: ProductFormComponent },
      { path: 'editar/:id', component: ProductFormComponent },
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];
