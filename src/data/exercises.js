// Default exercise database organized by muscle group and equipment
export const DEFAULT_EXERCISES = [
  // Chest
  {
    id: 'chest_pushup',
    name: 'Push-up',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    trackingType: 'reps', // reps, weight, time, distance
    description: 'Standard push-up for chest, shoulders, and triceps'
  },
  {
    id: 'chest_bench_press',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    trackingType: 'weight', // we'll track weight lifted
    description: 'Barbell bench press for chest development'
  },
  {
    id: 'chest_dumbbell_press',
    name: 'Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell bench press for chest'
  },
  {
    id: 'chest_incline_press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Incline dumbbell press for upper chest'
  },
  {
    id: 'chest_flyes',
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell flyes for chest stretch'
  },
  {
    id: 'chest_dips',
    name: 'Dips',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Parallel bar dips for chest and triceps'
  },

  // Back
  {
    id: 'back_pullups',
    name: 'Pull-up',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Standard pull-up for back and biceps'
  },
  {
    id: 'back_chinups',
    name: 'Chin-up',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Chin-up with underhand grip for biceps and back'
  },
  {
    id: 'back_barbell_row',
    name: 'Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Barbell bent-over row for back thickness'
  },
  {
    id: 'back_dumbbell_row',
    name: 'Dumbbell Row',
    muscleGroup: 'Back',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'One-arm dumbbell row for back'
  },
  {
    id: 'back_lat_pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Machine',
    trackingType: 'weight',
    description: 'Cable lat pulldown for back width'
  },
  {
    id: 'back_deadlift',
    name: 'Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Barbell deadlift for posterior chain'
  },

  // Legs
  {
    id: 'legs_squat',
    name: 'Squat',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Bodyweight squat for quadriceps and glutes'
  },
  {
    id: 'legs_barbell_squat',
    name: 'Barbell Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Barbell back squat for leg development'
  },
  {
    id: 'legs_front_squat',
    name: 'Front Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Barbell front squat for quadriceps'
  },
  {
    id: 'legs_lunge',
    name: 'Lunge',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Walking lunge for legs and balance'
  },
  {
    id: 'legs_leg_press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    trackingType: 'weight',
    description: 'Machine leg press for quadriceps'
  },
  {
    id: 'legs_leg_curl',
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    trackingType: 'weight',
    description: 'Machine leg curl for hamstrings'
  },
  {
    id: 'legs_calf_raise',
    name: 'Calf Raise',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Standing calf raise for calves'
  },

  // Shoulders
  {
    id: 'shoulders_overhead_press',
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Barbell overhead press for shoulders'
  },
  {
    id: 'shoulders_dumbbell_press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell shoulder press for shoulders'
  },
  {
    id: 'shoulders_lateral_raise',
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell lateral raise for shoulder width'
  },
  {
    id: 'shoulders_front_raise',
    name: 'Front Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell front raise for anterior shoulders'
  },
  {
    id: 'shoulders_rear_delt_fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell rear delt fly for posterior shoulders'
  },
  {
    id: 'shoulders_shrugs',
    name: 'Shrugs',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell shrugs for traps'
  },

  // Arms
  {
    id: 'arms_bicep_curl',
    name: 'Bicep Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Dumbbell bicep curl for biceps'
  },
  {
    id: 'arms_hammer_curl',
    name: 'Hammer Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Hammer curl for biceps and forearms'
  },
  {
    id: 'arms_tricep_extension',
    name: 'Tricep Extension',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Overhead dumbbell tricep extension'
  },
  {
    id: 'arms_tricep_pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms',
    equipment: 'Cable',
    trackingType: 'weight',
    description: 'Cable tricep pushdown for triceps'
  },
  {
    id: 'arms_close_grip_bench',
    name: 'Close Grip Bench Press',
    muscleGroup: 'Arms',
    equipment: 'Barbell',
    trackingType: 'weight',
    description: 'Close grip bench press for triceps'
  },
  {
    id: 'arms_wrist_curl',
    name: 'Wrist Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    trackingType: 'weight',
    description: 'Wrist curl for forearms'
  },

  // Core
  {
    id: 'core_situp',
    name: 'Sit-up',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Standard sit-up for abdominals'
  },
  {
    id: 'core_crunch',
    name: 'Crunch',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Abdominal crunch for core'
  },
  {
    id: 'core_plank',
    name: 'Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'time', // seconds
    description: 'Standard plank for core stability'
  },
  {
    id: 'core_side_plank',
    name: 'Side Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'time', // seconds per side
    description: 'Side plank for obliques'
  },
  {
    id: 'core_leg_raise',
    name: 'Leg Raise',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Hanging leg raise for lower abs'
  },
  {
    id: 'core_russian_twist',
    name: 'Russian Twist',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Russian twist for obliques'
  },
  {
    id: 'core_bicycle_crunch',
    name: 'Bicycle Crunch',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Bicycle crunch for rectus abdominis and obliques'
  },

  // Cardio
  {
    id: 'cardio_running',
    name: 'Running',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    trackingType: 'distance', // km or miles
    description: 'Running for cardiovascular endurance'
  },
  {
    id: 'cardio_cycling',
    name: 'Cycling',
    muscleGroup: 'Cardio',
    equipment: 'Bicycle',
    trackingType: 'distance', // km
    description: 'Cycling for cardiovascular endurance'
  },
  {
    id: 'cardio_jumping_rope',
    name: 'Jumping Rope',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    trackingType: 'time', // minutes
    description: 'Jumping rope for cardio and coordination'
  },
  {
    id: 'cardio_swimming',
    name: 'Swimming',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    trackingType: 'distance', // meters or laps
    description: 'Swimming for full-body cardio'
  },
  {
    id: 'cardio_hiit',
    name: 'HIIT',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    trackingType: 'time', // minutes
    description: 'High-Intensity Interval Training'
  },

  // Full Body / Compound
  {
    id: 'fullbody_burpee',
    name: 'Burpee',
    muscleGroup: 'Full Body',
    equipment: 'Bodyweight',
    trackingType: 'reps',
    description: 'Burpee for full-body conditioning'
  },
  {
    id: 'fullbody_kettlebell_swing',
    name: 'Kettlebell Swing',
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    trackingType: 'weight',
    description: 'Kettlebell swing for posterior chain and cardio'
  },
  {
    id: 'fullbody_medicine_ball_slam',
    name: 'Medicine Ball Slam',
    muscleGroup: 'Full Body',
    equipment: 'Medicine Ball',
    trackingType: 'reps',
    description: 'Medicine ball slam for power and core'
  }
];

// Helper function to get exercise by id
export const getExerciseById = (id, exercises = DEFAULT_EXERCISES) => {
  return exercises.find(ex => ex.id === id) || null;
};

// Helper function to get exercises by muscle group
export const getExercisesByMuscleGroup = (muscleGroup, exercises = DEFAULT_EXERCISES) => {
  return exercises.filter(ex => ex.muscleGroup === muscleGroup);
};

// Helper function to get exercises by equipment
export const getExercisesByEquipment = (equipment, exercises = DEFAULT_EXERCISES) => {
  return exercises.filter(ex => ex.equipment === equipment);
};