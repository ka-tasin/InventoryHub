import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

const ActivityPage = () => {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: () => ordersApi.getActivity().then(r => r.data),
  });

  const items = Array.isArray(activity) ? activity : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : !items.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-10 w-10 mb-2" /><p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.action || item.type || 'Activity'}</p>
                    <p className="text-sm text-muted-foreground">{item.details || item.notes || item.description || ''}</p>
                    {item.user && <p className="text-xs text-muted-foreground mt-1">by {item.user.name || item.user.email}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
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

export default ActivityPage;
