import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, MapPin, Calendar, X, CheckCircle, Loader } from 'lucide-react';
import { createConsultation } from '../../api/consultations';
import { toast } from 'sonner';

const STEPS = ['type', 'details', 'confirm'];

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`rounded-full transition-all ${
            i === STEPS.indexOf(current)
              ? 'w-6 h-2 bg-teal-500'
              : i < STEPS.indexOf(current)
              ? 'w-2 h-2 bg-teal-400'
              : 'w-2 h-2 bg-slate-300 dark:bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

export function ConsultationModal({ animal, onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('type');
  const [consultType, setConsultType] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createConsultation({
        animal_id: animal.id,
        consultation_type: consultType,
        scheduled_at: scheduledAt,
        rancher_notes: notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations']);
      queryClient.invalidateQueries(['consultations', String(animal.id)]);
      toast.success('Consultation scheduled');
      onClose();
    },
    onError: () => toast.error('Failed to schedule consultation'),
  });

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              Schedule Vet Consultation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {animal.name} &middot; {animal.tag_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <StepDots current={step} />

          {/* Step 1: Type */}
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">
                How would you like to meet with the vet?
              </p>

              <button
                onClick={() => { setConsultType('virtual'); setStep('details'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center shrink-0 group-hover:bg-teal-200 dark:group-hover:bg-teal-500/30 transition-colors">
                  <Video size={24} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Virtual Consultation</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Video call with a licensed vet — fastest option</p>
                </div>
              </button>

              <button
                onClick={() => { setConsultType('in_person'); setStep('details'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/30 transition-colors">
                  <MapPin size={24} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">In-Person Visit</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vet visits the ranch for hands-on examination</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${consultType === 'virtual' ? 'bg-teal-100 dark:bg-teal-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                  {consultType === 'virtual'
                    ? <Video size={14} className="text-teal-600 dark:text-teal-400" />
                    : <MapPin size={14} className="text-amber-600 dark:text-amber-400" />
                  }
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {consultType === 'virtual' ? 'Virtual Consultation' : 'In-Person Visit'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Calendar size={14} className="inline mr-1.5" />
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={minDateTime}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Notes for the Vet
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Describe symptoms, concerns, or context for ${animal.name}...`}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!scheduledAt}
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors disabled:opacity-40 text-sm"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 space-y-3 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${consultType === 'virtual' ? 'bg-teal-100 dark:bg-teal-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                    {consultType === 'virtual'
                      ? <Video size={16} className="text-teal-600 dark:text-teal-400" />
                      : <MapPin size={16} className="text-amber-600 dark:text-amber-400" />
                    }
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {consultType === 'virtual' ? 'Virtual Consultation' : 'In-Person Visit'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(scheduledAt).toLocaleString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {notes && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep('details')}
                  disabled={mutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-sm disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <><Loader size={16} className="animate-spin" /> Scheduling...</>
                  ) : (
                    <><CheckCircle size={16} /> Confirm</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
