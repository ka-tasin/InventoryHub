import { useQuery } from '@tanstack/react-query';
import { productsApi, ordersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: string | number; icon: any; description?: string }) => (
  <Card className="animate-fade-in">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const { data: productStats, isLoading: loadingProductStats } = useQuery({
    queryKey: ['product-stats'],
    queryFn: () => productsApi.getStats().then(r => r.data),
  });

  const { data: orderStats, isLoading: loadingOrderStats } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => ordersApi.getStats().then(r => r.data),
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['activity'],
    queryFn: () => ordersApi.getActivity().then(r => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => productsApi.getLowStock().then(r => r.data),
  });

  const loading = loadingProductStats || loadingOrderStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your inventory overview.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Products" value={productStats?.totalProducts ?? 0} icon={Package} description={`${productStats?.activeProducts ?? 0} active`} />
          <StatCard title="Total Orders" value={orderStats?.totalOrders ?? 0} icon={ShoppingCart} description={`${orderStats?.pendingOrders ?? 0} pending`} />
          <StatCard title="Low Stock Items" value={lowStock?.length ?? 0} icon={AlertTriangle} description="Below threshold" />
          <StatCard title="Total Revenue" value={`$${Number(orderStats?.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} description={`${orderStats?.completedOrders ?? 0} completed`} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActivity ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !activity?.length ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(activity) ? activity : []).slice(0, 10).map((item: any, i: number) => (
                <div key={i} className="flex items-start justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{item.action || item.type || 'Activity'}</p>
                    <p className="text-muted-foreground text-xs">{item.details || item.notes || item.description || ''}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {item.createdAt ? format(new Date(item.createdAt), 'MMM d, HH:mm') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
