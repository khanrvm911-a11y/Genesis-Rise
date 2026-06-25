const translations = {
  'tracker.level': 'Level',
  'tracker.title': 'Title',
  'tracker.xp': 'XP',
  'tracker.power_level': 'Power Level',
  'tracker.streak': 'Streak',
  'tracker.days': 'Day Streak',
  'tracker.select_muscle_group': 'Select Muscle Group',
  'tracker.exercises': 'Exercises',
  'tracker.last_trained': 'Last Trained',
  'tracker.days_ago': '{days} Days Ago',
  'tracker.never': 'Never',
  'tracker.search_exercises': 'Search exercises...',
  'tracker.difficulty': 'Difficulty',
  'tracker.xp_reward': 'XP Reward',
  'tracker.last_performance': 'Last',
  'tracker.start_exercise': 'Start Exercise',
  'tracker.back': 'Back',
  'tracker.set': 'Set',
  'tracker.weight': 'Weight (kg)',
  'tracker.reps': 'Reps',
  'tracker.add_set': 'Add Set',
  'tracker.save': 'Save',
  'tracker.cancel': 'Cancel',
  'tracker.edit': 'Edit',
  'tracker.delete': 'Delete',
  'tracker.no_sets_yet': 'No sets yet. Add your first set.',
  'tracker.duration': 'Duration',
  'tracker.volume': 'Volume',
  'tracker.calories': 'Calories',
  'tracker.complete_workout': 'Complete Workout',
  'tracker.rest_timer': 'Rest Timer',
  'tracker.pause': 'Pause',
  'tracker.resume': 'Resume',
  'tracker.skip': 'Skip',
  'tracker.mission_complete': 'Mission Complete',
  'tracker.xp_earned': 'XP Earned',
  'tracker.new_prs': 'New Personal Records',
  'tracker.level_progress': 'Level Progress',
  'tracker.power_level_increase': 'Power Level Increase',
  'tracker.new_workout': 'New Workout',
  'tracker.view_analytics': 'View Analytics',
  'tracker.analytics': 'Analytics',
  'tracker.no_workout_history': 'No workout history yet. Complete your first workout to unlock analytics.',
  'tracker.new_personal_record': 'New Personal Record',
  'tracker.previous': 'Previous',
  'tracker.reward': 'Reward',
  'tracker.new_pr_desc': 'Heaviest Weight',
  'tracker.new_pr_reps': 'Highest Reps',
  'tracker.continue': 'Continue',
  'tracker.exercise_difficulty_beginner': 'Beginner',
  'tracker.exercise_difficulty_intermediate': 'Intermediate',
  'tracker.exercise_difficulty_advanced': 'Advanced',
};

export function t(key, params) {
  let value = translations[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });
  }
  return value;
}
