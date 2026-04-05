import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Flag, Trash2, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { getAnimalById, toggleAnimalFlag, deleteAnimal } from '../api/animals';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { ConsultationModal } from '../components/ui/ConsultationModal';
import { toast } from 'sonner';

export function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('temperature');
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [showBehaviorInfo, setShowBehaviorInfo] = useState(false);

  const { data: animal, isLoading: animalLoading, error: animalError } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimalById(id),
  });

  const { data: notesData } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => getNotes(id),
  });

  const toggleFlagMutation = useMutation({
    mutationFn: () => toggleAnimalFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['animal', id]);
      toast.success('Flag toggled');
    },
  });

  const deleteAnimalMutation = useMutation({
    mutationFn: () => deleteAnimal(id),
    onSuccess: () => {
      toast.success('Animal deleted');
      navigate('/dashboard');
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (note) => createNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', id]);
      setNewNote('');
      toast.success('Note added');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, text }) => updateNote(noteId, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', id]);
      setEditingNoteId(null);
      toast.success('Note updated');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', id]);
      toast.success('Note deleted');
    },
  });

  const animalData = animal?.data;
  const notes = notesData?.data || [];

  if (animalError) {
    return (
      <div className="p-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-teal-400 mb-6 hover:text-teal-300">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <GlassCard className="p-6 border-red-500/50">
          <p className="text-red-300">Error loading animal</p>
        </GlassCard>
      </div>
    );
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return age - 1 + ' years';
    }
    return age + ' years';
  };

  const toF = (c) => c != null ? (parseFloat(c) * 9 / 5 + 32) : null;

  const chartData = [];
  if (animalData?.telemetry_24h) {
    const noseRing = [...(animalData.telemetry_24h.nose_ring || [])].reverse();
    noseRing.forEach((reading, idx) => {
      chartData[idx] = chartData[idx] || {};
      const d = new Date(reading.recorded_at);
      chartData[idx].time = isNaN(d) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      chartData[idx].temperature = toF(reading.temperature_c);
      chartData[idx].respiratory_rate = parseFloat(reading.respiratory_rate) || null;
    });

    const earTag = [...(animalData.telemetry_24h.ear_tag || [])].reverse();
    earTag.forEach((reading, idx) => {
      chartData[idx] = chartData[idx] || {};
      if (!chartData[idx].time) {
        const d = new Date(reading.recorded_at);
        chartData[idx].time = isNaN(d) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      chartData[idx].behavior_index = parseFloat(reading.behavior_index) || null;
    });
  }

  const handleDeleteAnimal = () => {
    if (window.confirm('Are you sure you want to delete this animal? This cannot be undone.')) {
      deleteAnimalMutation.mutate();
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Back Button */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300">
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      {animalLoading ? (
        <div className="space-y-6">
          <div className="h-32 bg-slate-200/60 dark:bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200/60 dark:bg-white/5 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <GlassCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                  {animalData?.name || 'Unknown'}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-slate-500 dark:text-slate-400">Tag: {animalData?.tag_id}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {animalData?.breed || 'Unknown breed'} • {calculateAge(animalData?.birth_date)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFlagMutation.mutate()}
                  className="p-3 rounded-lg border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <Flag size={20} fill={animalData?.is_manually_flagged ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleDeleteAnimal}
                  className="p-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <RiskBadge risk={animalData?.current_risk} flagged={animalData?.is_manually_flagged} />
          </GlassCard>

          {/* High Risk Alert Banner */}
          {animalData?.current_risk === 'High' && animalData?.latest_alert && (
            <GlassCard className="p-6 border-red-500/50 bg-red-50 dark:bg-red-500/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-300 mb-2">Active High Risk Alert</h3>
                  <p className="text-sm text-red-700 dark:text-red-200 mb-3">
                    ML Score: {animalData.latest_alert.ml_score != null ? (parseFloat(animalData.latest_alert.ml_score) * 100).toFixed(1) : '—'}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(animalData.latest_alert.triggered_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowConsultModal(true)}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap font-semibold text-sm"
                >
                  <CalendarPlus size={16} />
                  Schedule Vet Consultation
                </button>
              </div>
            </GlassCard>
          )}

          {/* Consultation Modal */}
          {showConsultModal && (
            <ConsultationModal
              animal={{ id: Number(id), name: animalData?.name, tag_id: animalData?.tag_id }}
              onClose={() => setShowConsultModal(false)}
            />
          )}

          {/* Sensor Readings — all sensors under Nose Ring heading */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-5">Nose Ring</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {/* Temperature */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Temperature</p>
                <p className={`text-2xl font-bold ${toF(animalData?.nose_ring?.temperature_c) > 103.1 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                  {animalData?.nose_ring?.temperature_c != null ? toF(animalData.nose_ring.temperature_c).toFixed(1) : '—'}°F
                </p>
                {toF(animalData?.nose_ring?.temperature_c) > 103.1 && (
                  <p className="text-xs text-red-600 dark:text-red-300">⚠️ Above 103.1°F</p>
                )}
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Respiratory Rate</p>
                <p className={`text-2xl font-bold ${parseFloat(animalData?.nose_ring?.respiratory_rate) > 40 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                  {animalData?.nose_ring?.respiratory_rate != null ? Math.round(parseFloat(animalData.nose_ring.respiratory_rate)) : '—'}
                </p>
                <p className="text-xs text-slate-400">breaths/minute</p>
                {parseFloat(animalData?.nose_ring?.respiratory_rate) > 40 && (
                  <p className="text-xs text-red-600 dark:text-red-300">⚠️ Above 40</p>
                )}
              </div>

              {/* Chew Frequency */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chew Frequency</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {animalData?.collar?.chew_frequency != null ? parseFloat(animalData.collar.chew_frequency).toFixed(1) : '—'}
                </p>
                <p className="text-xs text-slate-400">chews/min</p>
              </div>

              {/* Cough Count */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cough Count</p>
                <p className={`text-2xl font-bold ${animalData?.collar?.cough_count > 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {animalData?.collar?.cough_count ?? '0'}
                </p>
                <p className="text-xs text-slate-400">last reading</p>
                {animalData?.collar?.cough_count > 5 && (
                  <p className="text-xs text-amber-600 dark:text-amber-300">⚠️ Elevated</p>
                )}
              </div>

              {/* Behavior Index */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Behavior Index</p>
                <div className="flex items-end gap-1">
                  <p className={`text-2xl font-bold ${parseFloat(animalData?.ear_tag?.behavior_index) < 50 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {animalData?.ear_tag?.behavior_index != null ? (parseFloat(animalData.ear_tag.behavior_index) / 10).toFixed(1) : '—'}
                  </p>
                  <span className="text-xs text-slate-400 mb-1">/ 10</span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all ${parseFloat(animalData?.ear_tag?.behavior_index) < 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${parseFloat(animalData?.ear_tag?.behavior_index) || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Telemetry Chart */}
          {chartData.length > 0 && (
            <GlassCard className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">24-Hour Telemetry</h3>
                  <div className="flex gap-2 mb-4">
                    {['temperature', 'respiratory_rate', 'behavior_index'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${activeTab === tab
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                          }
                        `}
                      >
                        {tab === 'temperature' && 'Temperature'}
                        {tab === 'respiratory_rate' && 'Respiratory Rate'}
                        {tab === 'behavior_index' && 'Behavior Index'}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ left: 16, right: 8, bottom: 24, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis
                      dataKey="time"
                      stroke="rgba(100,116,139,0.4)"
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="rgba(100,116,139,0.4)"
                      tick={{ fontSize: 11 }}
                      width={56}
                      domain={
                        activeTab === 'temperature'
                          ? [97, 107]
                          : activeTab === 'respiratory_rate'
                          ? [20, 70]
                          : [0, 100]
                      }
                    >
                      <Label
                        value={
                          activeTab === 'temperature'
                            ? '°F'
                            : activeTab === 'respiratory_rate'
                            ? 'breaths/min'
                            : 'index (0–100)'
                        }
                        angle={-90}
                        position="insideLeft"
                        offset={-4}
                        style={{ fontSize: 11, fill: 'rgba(100,116,139,0.7)' }}
                      />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(100,116,139,0.2)',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#000' }}
                      formatter={(value, name) => {
                        if (name === 'temperature') return [`${value?.toFixed(1)}°F`, 'Temperature'];
                        if (name === 'respiratory_rate') return [`${Math.round(value)} breaths/min`, 'Respiratory Rate'];
                        if (name === 'behavior_index') return [value?.toFixed(1), 'Behavior Index'];
                        return [value, name];
                      }}
                    />
                    {activeTab === 'temperature' && (
                      <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    )}
                    {activeTab === 'respiratory_rate' && (
                      <Line type="monotone" dataKey="respiratory_rate" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    )}
                    {activeTab === 'behavior_index' && (
                      <Line type="monotone" dataKey="behavior_index" stroke="#14b8a6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Behavior Index Explainer */}
          <GlassCard className="p-6">
            <button
              onClick={() => setShowBehaviorInfo(!showBehaviorInfo)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">About Behavior Index</h3>
              {showBehaviorInfo ? <ChevronUp className="text-slate-600 dark:text-slate-300" /> : <ChevronDown className="text-slate-600 dark:text-slate-300" />}
            </button>
            {showBehaviorInfo && (
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-4">
                Behavior index is derived from lying-fraction data. Values below 0.5 may indicate reduced activity, though environmental and individual factors can cause variation independent of illness.
              </p>
            )}
          </GlassCard>

          {/* Notes Section */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">Notes</h3>

            <div className="space-y-4">
              <div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:border-teal-500 outline-none"
                  rows={3}
                />
                <button
                  onClick={() => createNoteMutation.mutate(newNote)}
                  disabled={!newNote.trim()}
                  className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  Add Note
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-slate-100 dark:bg-white/5 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                      {editingNoteId === note.id ? (
                        <div>
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded p-2 text-slate-900 dark:text-white text-sm mb-2"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateNoteMutation.mutate({ noteId: note.id, text: editingNoteText })}
                              className="px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1 bg-slate-400 dark:bg-slate-500 text-white rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-900 dark:text-white text-sm mb-2">{note.note}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.note);
                                }}
                                className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
