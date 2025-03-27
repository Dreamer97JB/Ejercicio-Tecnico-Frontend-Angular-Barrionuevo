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

  createProduct(product: FinancialProduct): Observable<{ message: string; data: FinancialProduct }> {
    return this.http.post<{ message: string; data: FinancialProduct }>(this.baseUrl, product);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }

}
