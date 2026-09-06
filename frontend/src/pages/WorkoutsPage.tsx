import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WorkoutPlan, Member, WorkoutExercise } from '../types';

export const WorkoutsPage: React.FC = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Workout form
  const [planName, setPlanName] = useState('Upper Body Hypertrophy');
  const [goal, setGoal] = useState('Muscle hypertrophy and back thickness');
  const [memberId, setMemberId] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      id: 'ex-1',
      name: 'Barbell Bench Press',
      sets: 4,
      reps: 8,
      weightKg: 85,
      restSeconds: 90,
      instructions: 'Retract scapulae, touch lower sternum with control.',
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: 10,
      weightKg: 30,
      restSeconds: 60,
      instructions: '30-degree bench angle, explosive concentric.',
    },
  ]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const [wRes, mRes] = await Promise.all([api.getWorkouts(), api.getMembers()]);
      setPlans(wRes.data || []);
      setMembers(mRes.data || []);
      if (wRes.data?.[0] && !selectedPlan) {
        setSelectedPlan(wRes.data[0]);
      }
      if (mRes.data?.[0]) {
        setMemberId(mRes.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleAddExerciseRow = () => {
    setExercises([
      ...exercises,
      {
        id: `ex-${Date.now()}`,
        name: 'New Exercise',
        sets: 3,
        reps: 12,
        weightKg: 20,
        restSeconds: 60,
        instructions: 'Maintain strict posture.',
      },
    ]);
  };

  const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...exercises];
    (updated[index] as any)[field] = value;
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorkout({
        memberId,
        name: planName,
        goal,
        exercises,
      });
      setShowCreateModal(false);
      fetchWorkouts();
    } catch (err: any) {
      alert(err.message || 'Failed to create workout plan');
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Header & New Routine Button */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">
            Performance Workout Builder
          </h3>
          <p className="text-xs text-[#7d8dae] mt-0.5">
            Prescribe tailored exercise regimens, track weight progression, and rest intervals.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition active:scale-95 shrink-0 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Assign New Routine</span>
        </button>
      </div>

      {/* Main Grid: Plan Selector + Selected Routine Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Plans List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-[#7e8eb2] uppercase tracking-wider mb-2">
            Active Regimens ({plans.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#6e7e9f]">Loading workout routines...</div>
          ) : plans.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6e7e9f]">No routines generated yet.</div>
          ) : (
            plans.map((p) => {
              const isSelected = selectedPlan?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedPlan(p)}
                  className={`p-4 rounded-2xl bg-[#0e172c] border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-[#1e2a4a] hover:border-[#2b3a62]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold text-sm text-white">{p.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#8292b5] line-clamp-1">{p.goal}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#6d7e9f]">
                    <span>
                      Client: <strong className="text-white">{p.memberName}</strong>
                    </span>
                    <span>{p.exercises?.length || 0} Movements</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Plan Exercise Details */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-6 sticky top-28">
            {selectedPlan ? (
              <>
                <div className="pb-4 border-b border-[#1b2746] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-primary tracking-wider">
                      Prescription Specification
                    </span>
                    <h4 className="font-display font-bold text-lg text-white mt-0.5">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-xs text-[#8797bd] mt-1">{selectedPlan.goal}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-semibold text-white">
                      Athlete: {selectedPlan.memberName}
                    </div>
                    <div className="text-[11px] text-[#6f7f9f]">
                      Coach: {selectedPlan.trainerName || 'Head Coach'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#8091b5] uppercase tracking-wider">
                    Exercise Protocol Breakdown
                  </div>

                  <div className="space-y-3">
                    {selectedPlan.exercises?.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="p-4 rounded-2xl bg-[#121c35] border border-[#1e2d4e] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-primary/20 text-primary font-mono text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-display font-bold text-sm text-white">
                              {ex.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="px-2 py-0.5 rounded bg-[#182647] text-white">
                              {ex.sets} Sets × {ex.reps} Reps
                            </span>
                            {ex.weightKg && (
                              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                                {ex.weightKg} kg
                              </span>
                            )}
                            <span className="text-[#7c8cae]">{ex.restSeconds}s rest</span>
                          </div>
                        </div>

                        {ex.instructions && (
                          <div className="text-xs text-[#8495ba] bg-[#0b1222] p-2.5 rounded-xl border border-[#17233c] leading-relaxed">
                            {ex.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-[#6e7e9f]">
                Select a workout routine from the left panel.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Workout Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-[calc(100%-24px)] sm:max-w-2xl bg-[#0e162b] border border-[#233154] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col text-[#dae2fd]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2744] shrink-0">
              <h3 className="font-display font-bold text-base text-white">Build Workout Routine</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6e7d9f] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">
                    Select Member *
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                  >
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.memberId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">
                    Routine Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">
                  Fitness Objective / Goal
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8091b5] uppercase tracking-wider">
                    Exercise Movements ({exercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 min-h-[36px]"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add Movement</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {exercises.map((ex, index) => (
                    <div
                      key={ex.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#131d36] border border-[#202d4f] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Movement Name"
                          value={ex.name}
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#0e162a] border border-[#233256] text-xs text-white focus:outline-none focus:border-primary font-semibold min-h-[38px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="text-[#647496] hover:text-rose-400 p-2 min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Remove movement"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-[#7181a4] block mb-0.5">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) =>
                              handleExerciseChange(index, 'sets', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0e162a] border border-[#233256] text-xs text-white font-mono text-center min-h-[36px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#7181a4] block mb-0.5">Reps</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) =>
                              handleExerciseChange(index, 'reps', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0e162a] border border-[#233256] text-xs text-white font-mono text-center min-h-[36px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#7181a4] block mb-0.5">Weight (kg)</label>
                          <input
                            type="number"
                            value={ex.weightKg || 0}
                            onChange={(e) =>
                              handleExerciseChange(index, 'weightKg', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0e162a] border border-[#233256] text-xs text-white font-mono text-center min-h-[36px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#7181a4] block mb-0.5">Rest (sec)</label>
                          <input
                            type="number"
                            value={ex.restSeconds}
                            onChange={(e) =>
                              handleExerciseChange(index, 'restSeconds', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-[#0e162a] border border-[#233256] text-xs text-white font-mono text-center min-h-[36px]"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Form cues & tempo notes..."
                        value={ex.instructions}
                        onChange={(e) => handleExerciseChange(index, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#0e162a] border border-[#233256] text-xs text-[#9eb0d6] placeholder-[#4e5c7d] min-h-[38px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-[#1c2744] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs text-[#7e8eb2] hover:bg-[#152038] min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs hover:brightness-110 min-h-[42px]"
                >
                  Publish Routine to Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
