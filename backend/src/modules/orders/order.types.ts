export interface CreateOrderInput {
  customerName: string;
  items: OrderItemInput[];
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface UpdateOrderInput {
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  customerName?: string;
  items?: OrderItemInput[];
}

export interface OrderFilters {
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      category: {
        name: string;
      };
    };
  }>;
}