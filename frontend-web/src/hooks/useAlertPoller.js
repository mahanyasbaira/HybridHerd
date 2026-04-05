import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAlerts } from '../api/alerts';

export function useAlertPoller() {
  const seenAlertsRef = useRef(new Set());

  const { data: alertsData, isLoading, error } = useQuery({
    queryKey: ['alerts-polling'],
    queryFn: () => getAlerts(false),
    refetchInterval: 30000,
    staleTime: 0,
  });

  useEffect(() => {
    if (!alertsData?.data) return;

    const alerts = alertsData.data;
    alerts.forEach((alert) => {
      if (!seenAlertsRef.current.has(alert.id) && alert.risk === 'High') {
        seenAlertsRef.current.add(alert.id);
        toast.error(`High Risk Alert: ${alert.animal_name}`, {
          description: `${alert.tag_id} - ML Score: ${(alert.ml_score * 100).toFixed(1)}%`,
          duration: 8000,
        });
      }
    });
  }, [alertsData]);

  const unreadCount = alertsData?.data?.length || 0;

  return { unreadCount, isLoading, error };
}
