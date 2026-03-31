export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  minThreshold?: number;
  categoryId: string;
  status?: 'ACTIVE' | 'OUT_OF_STOCK';
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  stock?: number;
  minThreshold?: number;
  categoryId?: string;
  status?: 'ACTIVE' | 'OUT_OF_STOCK';
}

export interface ProductFilters {
  status?: 'ACTIVE' | 'OUT_OF_STOCK';
  categoryId?: string;
  minStock?: boolean; 
  search?: string;
}