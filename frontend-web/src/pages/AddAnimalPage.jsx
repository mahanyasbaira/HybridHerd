import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createAnimal } from '../api/animals';
import { GlassCard } from '../components/ui/GlassCard';
import { GooeyInput } from '../components/ui/GooeyInput';
import { toast } from 'sonner';

export function AddAnimalPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tag_id: '',
    name: '',
    breed: '',
    birth_date: '',
  });

  const createAnimalMutation = useMutation({
    mutationFn: (data) => createAnimal(data),
    onSuccess: () => {
      toast.success('Animal added successfully');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add animal');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tag_id.trim()) {
      toast.error('Tag ID is required');
      return;
    }
    createAnimalMutation.mutate(formData);
  };

  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Add Animal</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Register a new animal in the system</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tag ID */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">
              Tag ID <span className="text-red-400">*</span>
            </label>
            <GooeyInput
              type="text"
              name="tag_id"
              value={formData.tag_id}
              onChange={handleChange}
              placeholder="e.g., TAG-001"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Name</label>
            <GooeyInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bessie"
            />
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Breed</label>
            <GooeyInput
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="e.g., Angus"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full bg-slate-100 border border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white rounded-lg px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500 outline-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAnimalMutation.isPending}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 font-medium"
            >
              {createAnimalMutation.isPending ? 'Adding...' : 'Add Animal'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
