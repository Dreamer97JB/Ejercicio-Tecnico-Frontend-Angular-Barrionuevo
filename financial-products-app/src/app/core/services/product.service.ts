import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FinancialProduct } from '../models/financial-product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<FinancialProduct[]> {
    return this.http.get<{ data: FinancialProduct[] }>(this.baseUrl).pipe(
      // Extract only the data array
      map(response => response.data)
    );
  }
}
