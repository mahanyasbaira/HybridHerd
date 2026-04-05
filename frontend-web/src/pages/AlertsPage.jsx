import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Lock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAlerts, acknowledgeAlert } from '../api/alerts';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { toast } from 'sonner';

export function AlertsPage() {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading, error } = useQuery({
    queryKey: ['all-alerts', showAcknowledged],
    queryFn: () => getAlerts(showAcknowledged ? true : false),
    refetchInterval: 30000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId) => acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-alerts']);
      queryClient.invalidateQueries(['alerts-polling']);
      toast.success('Alert acknowledged');
    },
  });

  const alerts = alertsData?.data || [];
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  // Group acknowledged high-risk alerts by animal
  const isolatedAnimals = useMemo(() => {
    const grouped = {};
    alerts.forEach((alert) => {
      if (alert.acknowledged && alert.current_risk === 'High') {
        const key = alert.animal_id || alert.animal_name;
        if (!grouped[key]) {
          grouped[key] = {
            animal_id: alert.animal_id,
            animal_name: alert.animal_name,
            tag_id: alert.tag_id,
            acknowledged_at: alert.acknowledged_at,
          };
        } else if (alert.acknowledged_at > grouped[key].acknowledged_at) {
          grouped[key].acknowledged_at = alert.acknowledged_at;
        }
      }
    });
    return Object.values(grouped);
  }, [alerts]);

  if (error) {
    return (
      <div className="p-8">
        <GlassCard className="p-6 border-red-500/50">
          <p className="text-red-600 dark:text-red-300">Error loading alerts</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          Alerts
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {unacknowledgedCount} unacknowledged
        </p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAcknowledged(false)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${!showAcknowledged
              ? 'bg-teal-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }
          `}
        >
          Unacknowledged ({unacknowledgedCount})
        </button>
        <button
          onClick={() => setShowAcknowledged(true)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${showAcknowledged
              ? 'bg-teal-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }
          `}
        >
          All
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <GlassCard key={i} className="p-6 h-24 animate-pulse bg-white/10" />
            ))
        ) : alerts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <CheckCircle className="mx-auto mb-4 text-emerald-400" size={48} />
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              {showAcknowledged ? 'No alerts' : 'No active alerts'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              All animals are healthy
            </p>
          </GlassCard>
        ) : (
          alerts.map((alert) => (
            <GlassCard
              key={alert.id}
              className={`
                p-6 border-l-4
                ${alert.risk === 'High' ? 'border-l-red-500' : 'border-l-emerald-500'}
                ${alert.acknowledged ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-1">
                    {alert.animal_name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Tag: {alert.tag_id}
                  </p>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div>
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${alert.previous_risk === 'Low'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                        }
                      `}>
                        {alert.previous_risk}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm mx-2">→</span>
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${alert.current_risk === 'Low'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                        }
                      `}>
                        {alert.current_risk}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500 dark:text-slate-400">ML Score: </span>
                      <span className={`font-bold ${parseFloat(alert.ml_score) > 0.7 ? 'text-red-400' : 'text-amber-400'}`}>
                        {alert.ml_score != null ? (parseFloat(alert.ml_score) * 100).toFixed(1) : '—'}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {new Date(alert.timestamp).toLocaleString()}
                    {alert.acknowledged_at && (
                      <>
                        {' • '}
                        Acknowledged {new Date(alert.acknowledged_at).toLocaleString()}
                      </>
                    )}
                  </p>
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                    disabled={acknowledgeAlertMutation.isPending}
                    className="ml-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Isolated Animals Section */}
      {showAcknowledged && isolatedAnimals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Isolated Animals</h2>
          </div>
          <GlassCard className="p-6 mb-4 bg-amber-50 border-amber-300/50 dark:bg-amber-500/5 dark:border-amber-500/30">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-200">Animals with acknowledged alerts are tracked here for monitoring.</p>
            </div>
          </GlassCard>
          <div className="space-y-3">
            {isolatedAnimals.map((animal) => (
              <GlassCard
                key={animal.animal_id || animal.animal_name}
                className="p-6 border-l-4 border-l-amber-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-1">
                      {animal.animal_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      Tag: {animal.tag_id}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Last acknowledged {new Date(animal.acknowledged_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/animals/${animal.animal_id}`}
                    className="ml-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    View Animal
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
