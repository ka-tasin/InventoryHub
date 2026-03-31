export interface RestockQueueItem {
  id: string;
  productId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  addedAt: Date;
  product: {
    id: string;
    name: string;
    stock: number;
    minThreshold: number;
    category: {
      name: string;
    };
  };
}

export interface RestockInput {
  quantity: number;
  notes?: string;
}