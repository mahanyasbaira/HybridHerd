import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, Flag } from 'lucide-react';
import { getAnimals } from '../api/animals';
import { GlassCard } from '../components/ui/GlassCard';
import { GooeyInput } from '../components/ui/GooeyInput';
import { RiskBadge } from '../components/ui/RiskBadge';

export function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const { data: animalsData, isLoading, error } = useQuery({
    queryKey: ['animals', riskFilter],
    queryFn: () => getAnimals(riskFilter),
  });

  const animals = animalsData?.data || [];

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const search = searchTerm.toLowerCase();
      return (
        (animal.name?.toLowerCase().includes(search) || false) ||
        (animal.tag_id?.toLowerCase().includes(search) || false)
      );
    });
  }, [animals, searchTerm]);

  const stats = {
    total: animalsData?.data?.length || 0,
    highRisk: animals.filter((a) => a.current_risk === 'High').length,
    flagged: animals.filter((a) => a.is_manually_flagged).length,
  };

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

  if (error) {
    return (
      <div className="p-8">
        <GlassCard className="p-6 border-red-500/50">
          <p className="text-red-600 dark:text-red-300">Error loading animals: {error.message}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative z-10 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Animals</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {isLoading ? '...' : stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">High Risk</p>
              <p className="text-4xl font-bold text-red-400">
                {isLoading ? '...' : stats.highRisk}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Flagged</p>
              <p className="text-4xl font-bold text-amber-400">
                {isLoading ? '...' : stats.flagged}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <Flag className="text-amber-400" size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {['All', 'High', 'Medium', 'Low'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${riskFilter === filter
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }
              `}
            >
              {filter === 'All' ? 'All Animals' : `${filter} Risk`}
            </button>
          ))}
        </div>

        <GooeyInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or tag ID..."
          className="max-w-md"
        />
      </div>

      {/* Flagged Animals Section */}
      {stats.flagged > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag size={20} className="text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Flagged Animals</h2>
            <span className="ml-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
              {stats.flagged}
            </span>
          </div>
          <GlassCard className="p-6">
            <div className="space-y-3">
              {animals
                .filter((a) => a.is_manually_flagged)
                .map((animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white">{animal.name || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tag: {animal.tag_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskBadge risk={animal.current_risk} flagged={animal.is_manually_flagged} />
                      <Link
                        to={`/animals/${animal.id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Animal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <GlassCard key={i} className="p-6 h-64 animate-pulse bg-white/10" />
            ))
        ) : filteredAnimals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No animals found</p>
          </div>
        ) : (
          filteredAnimals.map((animal) => (
            <GlassCard
              key={animal.id}
              className={`p-6 border-l-4 ${
                animal.is_manually_flagged
                  ? 'border-l-amber-500'
                  : animal.current_risk === 'High'
                  ? 'border-l-red-500'
                  : animal.current_risk === 'Medium'
                  ? 'border-l-amber-500'
                  : 'border-l-emerald-500'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    {animal.name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tag: {animal.tag_id}</p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                      {animal.breed || 'No breed'} • {calculateAge(animal.birth_date)}
                    </p>
                  </div>
                  <RiskBadge risk={animal.current_risk} flagged={animal.is_manually_flagged} />
                </div>

                {/* Sensor Preview */}
                <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Temp</span>
                    <span className={parseFloat(animal.nose_ring?.temperature_c) > 39.5 ? 'text-red-400' : 'text-slate-900 dark:text-white'}>
                      {animal.nose_ring?.temperature_c != null ? parseFloat(animal.nose_ring.temperature_c).toFixed(1) : '—'}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Resp Rate</span>
                    <span className={parseFloat(animal.nose_ring?.respiratory_rate) > 40 ? 'text-red-400' : 'text-slate-900 dark:text-white'}>
                      {animal.nose_ring?.respiratory_rate != null ? Math.round(parseFloat(animal.nose_ring.respiratory_rate)) : '—'} br/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Behavior</span>
                    <span className={parseFloat(animal.ear_tag?.behavior_index) < 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {animal.ear_tag?.behavior_index != null ? (parseFloat(animal.ear_tag.behavior_index) / 10).toFixed(1) : '—'} / 10
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/animals/${animal.id}`}
                    className="flex-1 px-4 py-2 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors text-sm font-medium text-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add Animal Button */}
      <Link
        to="/animals/add"
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/50"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
