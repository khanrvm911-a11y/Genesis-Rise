import { useMemo } from 'react';

export default function AIAnalysis({ workoutHistory, personalRecords, stats, userSettings }) {
  const analysis = useMemo(() => {
    const insights = [];
    const warnings = [];
    const recommendations = [];

    if (!workoutHistory || workoutHistory.length === 0) {
      return {
        insights: ['No workout data available yet. Complete your first workout to receive AI analysis.'],
        warnings: [],
        recommendations: ['Start with a workout to begin your fitness journey.']
      };
    }

    const totalExercises = {};
    let chestCount = 0, backCount = 0, legCount = 0;
    let totalSets = 0;

    workoutHistory.forEach(w => {
      if (w.exercises) {
        w.exercises.forEach(ex => {
          const name = ex.exerciseData?.name || ex.exerciseId || 'Unknown';
          totalExercises[name] = (totalExercises[name] || 0) + (ex.sets?.length || 0);
          totalSets += ex.sets?.length || 0;

          const muscle = ex.exerciseData?.muscleGroup || '';
          if (muscle === 'Chest') chestCount++;
          else if (muscle === 'Back') backCount++;
          else if (muscle === 'Legs') legCount++;
        });
      }
    });

    const sortedExercises = Object.entries(totalExercises)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (sortedExercises.length > 0) {
      const [topExercise, topCount] = sortedExercises[0];
      insights.push(`Most performed exercise: ${topExercise} (${topCount} sets)`);
    }

    const prs = [];
    if (personalRecords) {
      Object.entries(personalRecords).forEach(([id, record]) => {
        if (record?.best?.weight && record.best.weight > 0) {
          prs.push({ id, weight: record.best.weight });
        }
      });
    }

    if (prs.length > 0) {
      const sortedPRs = prs.sort((a, b) => b.weight - a.weight);
      const top3 = sortedPRs.slice(0, 3);
      insights.push(`Top lifts: ${top3.map(p => `${p.weight}kg`).join(', ')}`);
    }

    if (stats.totalTime > 0) {
      const avgTime = stats.averageDuration;
      if (avgTime < 20) {
        warnings.push('Workouts are too short. Aim for 30-60 minute sessions.');
        recommendations.push('Increase workout duration to 30+ minutes for better results.');
      } else if (avgTime > 90) {
        warnings.push('Workouts may be too long. Consider splitting into focused sessions.');
        recommendations.push('Try splitting your workout into 45-60 minute focused sessions.');
      } else {
        insights.push(`Average workout duration: ${avgTime} minutes (optimal range)`);
      }
    }

    if (chestCount > 0 || backCount > 0 || legCount > 0) {
      const total = chestCount + backCount + legCount;
      const chestPct = (chestCount / total) * 100;
      const backPct = (backCount / total) * 100;
      const legPct = (legCount / total) * 100;

      if (legPct < 15 && total > 5) {
        warnings.push(`Leg training frequency is too low (${Math.round(legPct)}% of workouts).`);
        recommendations.push('Increase leg volume. Add squats, lunges, and leg press to your routine.');
      }

      if (backPct < 15 && total > 5) {
        recommendations.push('Add more pulling exercises (rows, pull-ups, lat pulldowns) for balanced development.');
      }

      if (chestPct > 50 && total > 5) {
        warnings.push('Chest volume dominates your training. Consider balancing with back and legs.');
        recommendations.push('Add more pulling exercises and leg work for balanced development.');
      }
    }

    if (stats.totalCalories > 0) {
      const avgCalPerWorkout = Math.round(stats.totalCalories / stats.totalWorkouts);
      insights.push(`Average calories burned per workout: ${avgCalPerWorkout} cal`);
    }

    const now = Date.now();
    const recentWorkouts = workoutHistory.filter(w => {
      return new Date(w.timestamp || w.date).getTime() > now - 14 * 24 * 60 * 60 * 1000;
    }).length;

    const recentVolume = workoutHistory
      .filter(w => new Date(w.timestamp || w.date).getTime() > now - 14 * 24 * 60 * 60 * 1000)
      .reduce((sum, w) => {
        let vol = 0;
        if (w.exercises) {
          w.exercises.forEach(ex => {
            if (ex.sets) {
              ex.sets.forEach(set => {
                vol += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
              });
            }
          });
        }
        return sum + vol;
      }, 0);

    if (recentWorkouts > 0) {
      const priorWorkouts = workoutHistory.filter(w => {
        const t = new Date(w.timestamp || w.date).getTime();
        return t > now - 28 * 24 * 60 * 60 * 1000 && t <= now - 14 * 24 * 60 * 60 * 1000;
      }).length;

      if (recentWorkouts > priorWorkouts && priorWorkouts > 0) {
        const pct = Math.round(((recentWorkouts - priorWorkouts) / priorWorkouts) * 100);
        insights.push(`Workout frequency up ${pct}% compared to previous two weeks.`);
      } else if (recentWorkouts < priorWorkouts && priorWorkouts > 0) {
        const pct = Math.round(((priorWorkouts - recentWorkouts) / priorWorkouts) * 100);
        warnings.push(`Workout frequency down ${pct}% compared to previous two weeks.`);
        recommendations.push('Try to maintain consistency. Schedule your workouts in advance.');
      }
    }

    const benchPR = personalRecords?.chest_bench_press?.best?.weight || 0;
    const squatPR = personalRecords?.legs_barbell_squat?.best?.weight || 0;
    const deadliftPR = personalRecords?.back_deadlift?.best?.weight || 0;

    if (benchPR > 0) {
      const benchHistory = personalRecords?.chest_bench_press?.history || [];
      if (benchHistory.length >= 2) {
        const recent = benchHistory[benchHistory.length - 1]?.weight || 0;
        const older = benchHistory[0]?.weight || 0;
        if (recent > older && older > 0) {
          const pct = Math.round(((recent - older) / older) * 100);
          insights.push(`Bench Press strength up ${pct}% across tracked history.`);
        }
      }
    }

    if (benchPR > 0 && squatPR > 0 && deadliftPR > 0) {
      const total = benchPR + squatPR + deadliftPR;
      const bodyweight = userSettings?.weight || 70;
      const ratio = (total / bodyweight).toFixed(1);
      insights.push(`Total (bench+squat+deadlift): ${total}kg (${ratio}x bodyweight)`);
    }

    if (stats.currentStreak >= 7) {
      insights.push(`Current streak: ${stats.currentStreak} days. Consistency is key! Keep going.`);
    } else if (stats.currentStreak >= 3) {
      insights.push(`${stats.currentStreak}-day streak. Building momentum!`);
    }

    if (stats.totalWorkouts >= 10) {
      insights.push(`${stats.totalWorkouts} total workouts completed. Progress is real!`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Great balance in your training! Keep pushing your limits.');
    }

    return { insights, warnings, recommendations };
  }, [workoutHistory, personalRecords, stats, userSettings]);

  return (
    <div className="sl-card">
      <h3 className="text-xl font-bold text-white mb-4">AI Analysis</h3>

      {analysis.insights.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-sl-purple-light uppercase tracking-wider mb-2 font-semibold">Insights</p>
          <div className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <div key={i} className="bg-sl-purple/10 border border-sl-purple/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-sl-purple-light mt-0.5">📈</span>
                <p className="text-white text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.warnings.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-yellow-400 uppercase tracking-wider mb-2 font-semibold">Warnings</p>
          <div className="space-y-2">
            {analysis.warnings.map((warning, i) => (
              <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">⚠️</span>
                <p className="text-white text-sm">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div>
          <p className="text-sm text-green-400 uppercase tracking-wider mb-2 font-semibold">Recommendations</p>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">💡</span>
                <p className="text-white text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
