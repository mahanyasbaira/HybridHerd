import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Video, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { getConsultations, updateConsultationStatus } from '../api/consultations';
import { GlassCard } from '../components/ui/GlassCard';
import { toast } from 'sonner';

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  confirmed: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  completed: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
};

const NEXT_STATUSES = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function ConsultationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: getConsultations,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateConsultationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations']);
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const consultations = data?.data || [];

  const upcoming = consultations.filter((c) => c.status === 'pending' || c.status === 'confirmed');
  const past = consultations.filter((c) => c.status === 'completed' || c.status === 'cancelled');

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">
          Vet Consultations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Manage scheduled virtual and in-person vet appointments
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200/60 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No consultations yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Open a high-risk animal's detail page to schedule a consultation.
          </p>
        </GlassCard>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <ConsultationCard key={c.id} c={c} onStatusChange={(status) => statusMutation.mutate({ id: c.id, status })} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 mt-6">
                Past ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((c) => (
                  <ConsultationCard key={c.id} c={c} onStatusChange={(status) => statusMutation.mutate({ id: c.id, status })} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ConsultationCard({ c, onStatusChange }) {
  const nextStatuses = NEXT_STATUSES[c.status] || [];

  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          c.consultation_type === 'virtual'
            ? 'bg-teal-100 dark:bg-teal-500/20'
            : 'bg-amber-100 dark:bg-amber-500/20'
        }`}>
          {c.consultation_type === 'virtual'
            ? <Video size={20} className="text-teal-600 dark:text-teal-400" />
            : <MapPin size={20} className="text-amber-600 dark:text-amber-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {c.animal_name}
            </span>
            <span className="text-xs text-slate-400">#{c.tag_id}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {c.consultation_type === 'virtual' ? 'Virtual' : 'In-Person'} &middot;{' '}
            {new Date(c.scheduled_at).toLocaleString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {c.rancher_notes && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate max-w-md">
              {c.rancher_notes}
            </p>
          )}
        </div>

        {nextStatuses.length > 0 && (
          <div className="relative shrink-0">
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) onStatusChange(e.target.value); }}
              className="appearance-none bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:outline-none focus:border-teal-400"
            >
              <option value="" disabled>Update</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
