// Exercise library with categories and descriptions
export const EXERCISE_LIBRARY = {
  chest: [
    { name: 'Bench Press', icon: '💪', description: 'Barbell flat bench press', muscle: 'Chest, Triceps' },
    { name: 'Incline Bench Press', icon: '💪', description: 'Barbell incline press', muscle: 'Upper Chest' },
    { name: 'Decline Bench Press', icon: '💪', description: 'Barbell decline press', muscle: 'Lower Chest' },
    { name: 'Dumbbell Press', icon: '🏋️', description: 'Flat dumbbell press', muscle: 'Chest' },
    { name: 'Incline Dumbbell Press', icon: '🏋️', description: 'Incline dumbbell press', muscle: 'Upper Chest' },
    { name: 'Chest Fly', icon: '🦅', description: 'Dumbbell or cable fly', muscle: 'Chest' },
    { name: 'Cable Crossover', icon: '✖️', description: 'Cable chest crossover', muscle: 'Chest' },
    { name: 'Push-ups', icon: '🤸', description: 'Bodyweight push-ups', muscle: 'Chest, Triceps' },
    { name: 'Dips', icon: '🔻', description: 'Chest dips', muscle: 'Chest, Triceps' },
  ],
  back: [
    { name: 'Deadlift', icon: '🏋️', description: 'Conventional deadlift', muscle: 'Full Back, Legs' },
    { name: 'Barbell Row', icon: '🚣', description: 'Bent over barbell row', muscle: 'Back, Lats' },
    { name: 'Dumbbell Row', icon: '🚣', description: 'Single arm dumbbell row', muscle: 'Back, Lats' },
    { name: 'Pull-ups', icon: '⬆️', description: 'Overhand pull-ups', muscle: 'Lats, Back' },
    { name: 'Chin-ups', icon: '⬆️', description: 'Underhand chin-ups', muscle: 'Lats, Biceps' },
    { name: 'Lat Pulldown', icon: '⬇️', description: 'Cable lat pulldown', muscle: 'Lats' },
    { name: 'Seated Cable Row', icon: '🚣', description: 'Seated cable row', muscle: 'Back' },
    { name: 'T-Bar Row', icon: '🚣', description: 'T-bar row', muscle: 'Back' },
    { name: 'Face Pulls', icon: '😊', description: 'Cable face pulls', muscle: 'Rear Delts, Upper Back' },
  ],
  shoulders: [
    { name: 'Overhead Press', icon: '🏋️', description: 'Standing barbell press', muscle: 'Shoulders' },
    { name: 'Military Press', icon: '🎖️', description: 'Strict overhead press', muscle: 'Shoulders' },
    { name: 'Dumbbell Shoulder Press', icon: '🏋️', description: 'Seated dumbbell press', muscle: 'Shoulders' },
    { name: 'Lateral Raise', icon: '🦅', description: 'Dumbbell lateral raise', muscle: 'Side Delts' },
    { name: 'Front Raise', icon: '⬆️', description: 'Dumbbell front raise', muscle: 'Front Delts' },
    { name: 'Rear Delt Fly', icon: '🦅', description: 'Bent over rear delt fly', muscle: 'Rear Delts' },
    { name: 'Arnold Press', icon: '💪', description: 'Rotating dumbbell press', muscle: 'Shoulders' },
    { name: 'Shrugs', icon: '🤷', description: 'Barbell or dumbbell shrugs', muscle: 'Traps' },
    { name: 'Upright Row', icon: '⬆️', description: 'Barbell upright row', muscle: 'Shoulders, Traps' },
  ],
  arms: [
    { name: 'Barbell Curl', icon: '💪', description: 'Standing barbell curl', muscle: 'Biceps' },
    { name: 'Dumbbell Curl', icon: '💪', description: 'Alternating dumbbell curl', muscle: 'Biceps' },
    { name: 'Hammer Curl', icon: '🔨', description: 'Neutral grip dumbbell curl', muscle: 'Biceps, Forearms' },
    { name: 'Preacher Curl', icon: '💪', description: 'Preacher bench curl', muscle: 'Biceps' },
    { name: 'Cable Curl', icon: '💪', description: 'Cable bicep curl', muscle: 'Biceps' },
    { name: 'Tricep Pushdown', icon: '⬇️', description: 'Cable tricep pushdown', muscle: 'Triceps' },
    { name: 'Skull Crushers', icon: '💀', description: 'Lying tricep extension', muscle: 'Triceps' },
    { name: 'Overhead Tricep Extension', icon: '⬆️', description: 'Dumbbell overhead extension', muscle: 'Triceps' },
    { name: 'Close Grip Bench Press', icon: '💪', description: 'Narrow grip bench press', muscle: 'Triceps' },
    { name: 'Concentration Curl', icon: '💪', description: 'Seated concentration curl', muscle: 'Biceps' },
  ],
  legs: [
    { name: 'Squat', icon: '🏋️', description: 'Barbell back squat', muscle: 'Quads, Glutes' },
    { name: 'Front Squat', icon: '🏋️', description: 'Barbell front squat', muscle: 'Quads' },
    { name: 'Leg Press', icon: '🦵', description: 'Machine leg press', muscle: 'Quads, Glutes' },
    { name: 'Leg Extension', icon: '🦵', description: 'Machine leg extension', muscle: 'Quads' },
    { name: 'Leg Curl', icon: '🦵', description: 'Machine leg curl', muscle: 'Hamstrings' },
    { name: 'Romanian Deadlift', icon: '🏋️', description: 'RDL for hamstrings', muscle: 'Hamstrings, Glutes' },
    { name: 'Lunges', icon: '🚶', description: 'Walking or stationary lunges', muscle: 'Quads, Glutes' },
    { name: 'Bulgarian Split Squat', icon: '🦵', description: 'Rear foot elevated split squat', muscle: 'Quads, Glutes' },
    { name: 'Calf Raise', icon: '🦶', description: 'Standing or seated calf raise', muscle: 'Calves' },
    { name: 'Hack Squat', icon: '🏋️', description: 'Machine hack squat', muscle: 'Quads' },
    { name: 'Hip Thrust', icon: '🍑', description: 'Barbell hip thrust', muscle: 'Glutes' },
  ],
  core: [
    { name: 'Plank', icon: '🧘', description: 'Front plank hold', muscle: 'Core' },
    { name: 'Side Plank', icon: '🧘', description: 'Side plank hold', muscle: 'Obliques' },
    { name: 'Crunches', icon: '🔄', description: 'Abdominal crunches', muscle: 'Abs' },
    { name: 'Sit-ups', icon: '🔄', description: 'Full sit-ups', muscle: 'Abs' },
    { name: 'Russian Twist', icon: '🔄', description: 'Seated twisting motion', muscle: 'Obliques' },
    { name: 'Leg Raises', icon: '⬆️', description: 'Lying or hanging leg raises', muscle: 'Lower Abs' },
    { name: 'Mountain Climbers', icon: '⛰️', description: 'Dynamic mountain climbers', muscle: 'Core, Cardio' },
    { name: 'Ab Wheel', icon: '⭕', description: 'Ab wheel rollout', muscle: 'Core' },
    { name: 'Cable Crunch', icon: '🔄', description: 'Kneeling cable crunch', muscle: 'Abs' },
    { name: 'Bicycle Crunches', icon: '🚴', description: 'Alternating bicycle crunches', muscle: 'Abs, Obliques' },
  ],
  cardio: [
    { name: 'Running', icon: '🏃', description: 'Treadmill or outdoor running', muscle: 'Cardio' },
    { name: 'Cycling', icon: '🚴', description: 'Stationary or outdoor bike', muscle: 'Cardio, Legs' },
    { name: 'Rowing', icon: '🚣', description: 'Rowing machine', muscle: 'Full Body Cardio' },
    { name: 'Jump Rope', icon: '🪢', description: 'Skipping rope', muscle: 'Cardio' },
    { name: 'Burpees', icon: '💥', description: 'Full body burpees', muscle: 'Full Body, Cardio' },
    { name: 'Stair Climber', icon: '🪜', description: 'Stair climbing machine', muscle: 'Cardio, Legs' },
  ]
};

// Flatten for autocomplete (backward compatibility)
export const COMMON_EXERCISES = Object.values(EXERCISE_LIBRARY)
  .flat()
  .map(ex => ex.name)
  .sort();
