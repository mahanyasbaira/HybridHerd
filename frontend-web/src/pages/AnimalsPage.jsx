import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { getAnimals } from '../api/animals';
import { GlassCard } from '../components/ui/GlassCard';
import { GooeyInput } from '../components/ui/GooeyInput';
import { RiskBadge } from '../components/ui/RiskBadge';

export function AnimalsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: animalsData, isLoading, error } = useQuery({
    queryKey: ['animals-table'],
    queryFn: () => getAnimals('All'),
  });

  const animals = animalsData?.data || [];

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const search = searchTerm.toLowerCase();
      return (
        (animal.name?.toLowerCase().includes(search) || false) ||
        (animal.tag_id?.toLowerCase().includes(search) || false) ||
        (animal.breed?.toLowerCase().includes(search) || false)
      );
    });
  }, [animals, searchTerm]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            Animals
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {animals.length} total animals
          </p>
        </div>
        <Link
          to="/animals/add"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Animal
        </Link>
      </div>

      {/* Search */}
      <GooeyInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name, tag ID, or breed..."
        className="max-w-md"
      />

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tag ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Breed</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Age</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Risk</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Temp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Behavior</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Flagged</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-white/5">
                      {Array(9)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : filteredAnimals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No animals found</p>
                  </td>
                </tr>
              ) : (
                filteredAnimals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{animal.tag_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{animal.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{animal.breed || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{calculateAge(animal.birth_date)} years</td>
                    <td className="px-6 py-4 text-sm">
                      <RiskBadge risk={animal.current_risk} flagged={animal.is_manually_flagged} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {animal.nose_ring?.temperature_c != null
                        ? parseFloat(animal.nose_ring.temperature_c).toFixed(1) + '°C'
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {animal.ear_tag?.behavior_index != null ? (
                        <span className={parseFloat(animal.ear_tag.behavior_index) < 50 ? 'text-amber-400' : 'text-emerald-400'}>
                          {(parseFloat(animal.ear_tag.behavior_index) / 10).toFixed(1)} / 10
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {animal.is_manually_flagged ? (
                        <span className="text-amber-400">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/animals/${animal.id}`}
                        className="text-teal-400 hover:text-teal-300 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
