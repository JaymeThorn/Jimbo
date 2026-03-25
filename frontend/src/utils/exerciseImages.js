// Mapping of our exercise names to ExerciseDB names
const EXERCISE_NAME_MAP = {
  // Chest
  'Bench Press': 'barbell bench press',
  'Incline Bench Press': 'barbell incline bench press',
  'Decline Bench Press': 'barbell decline bench press',
  'Dumbbell Press': 'dumbbell bench press',
  'Incline Dumbbell Press': 'dumbbell incline bench press',
  'Chest Fly': 'dumbbell fly',
  'Cable Crossover': 'cable crossover',
  'Push-ups': 'push-up',
  'Dips': 'chest dip',
  
  // Back
  'Deadlift': 'barbell deadlift',
  'Barbell Row': 'barbell bent over row',
  'Dumbbell Row': 'dumbbell one arm row',
  'Pull-ups': 'pull-up',
  'Chin-ups': 'chin-up',
  'Lat Pulldown': 'cable lat pulldown',
  'Seated Cable Row': 'cable seated row',
  'T-Bar Row': 'barbell t-bar row',
  'Face Pulls': 'cable face pull',
  
  // Shoulders
  'Overhead Press': 'barbell standing overhead press',
  'Military Press': 'barbell military press',
  'Dumbbell Shoulder Press': 'dumbbell shoulder press',
  'Lateral Raise': 'dumbbell lateral raise',
  'Front Raise': 'dumbbell front raise',
  'Rear Delt Fly': 'dumbbell rear delt fly',
  'Arnold Press': 'dumbbell arnold press',
  'Shrugs': 'barbell shrug',
  'Upright Row': 'barbell upright row',
  
  // Arms
  'Barbell Curl': 'barbell curl',
  'Dumbbell Curl': 'dumbbell curl',
  'Hammer Curl': 'dumbbell hammer curl',
  'Preacher Curl': 'barbell preacher curl',
  'Cable Curl': 'cable curl',
  'Tricep Pushdown': 'cable pushdown',
  'Skull Crushers': 'barbell lying triceps extension',
  'Overhead Tricep Extension': 'dumbbell overhead triceps extension',
  'Close Grip Bench Press': 'barbell close-grip bench press',
  'Concentration Curl': 'dumbbell concentration curl',
  
  // Legs
  'Squat': 'barbell squat',
  'Front Squat': 'barbell front squat',
  'Leg Press': 'leg press',
  'Leg Extension': 'leg extension',
  'Leg Curl': 'leg curl',
  'Romanian Deadlift': 'barbell romanian deadlift',
  'Lunges': 'dumbbell lunge',
  'Bulgarian Split Squat': 'bulgarian split squat',
  'Calf Raise': 'standing calf raise',
  'Hack Squat': 'hack squat',
  'Hip Thrust': 'barbell hip thrust',
  
  // Core
  'Plank': 'plank',
  'Side Plank': 'side plank',
  'Crunches': 'crunch',
  'Sit-ups': 'sit-up',
  'Russian Twist': 'russian twist',
  'Leg Raises': 'leg raise',
  'Mountain Climbers': 'mountain climber',
  'Ab Wheel': 'ab wheel rollout',
  'Cable Crunch': 'cable crunch',
  'Bicycle Crunches': 'bicycle crunch',
  
  // Cardio
  'Running': 'running',
  'Cycling': 'cycling',
  'Rowing': 'rowing',
  'Jump Rope': 'jump rope',
  'Burpees': 'burpee',
  'Stair Climber': 'stair climber'
};

let exerciseImageCache = {};
let apiCallsFailed = false;

export const fetchExerciseImages = async () => {
  if (apiCallsFailed) return {}; // Skip if API already failed
  
  const apiKey = process.env.REACT_APP_EXERCISEDB_KEY;
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    console.log('ExerciseDB API key not configured, using emoji fallback');
    return {};
  }

  try {
    const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=1500', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const exercises = await response.json();
    
    // Map exercise names to GIF URLs
    const imageMap = {};
    exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      
      // Find matching exercises from our library
      Object.entries(EXERCISE_NAME_MAP).forEach(([ourName, apiName]) => {
        if (exerciseName.includes(apiName.toLowerCase()) || apiName.toLowerCase().includes(exerciseName)) {
          imageMap[ourName] = exercise.gifUrl;
        }
      });
    });

    exerciseImageCache = imageMap;
    console.log(`Loaded ${Object.keys(imageMap).length} exercise images from ExerciseDB`);
    return imageMap;
    
  } catch (error) {
    console.error('Failed to fetch exercise images, using emoji fallback:', error);
    apiCallsFailed = true;
    return {};
  }
};

export const getExerciseImage = (exerciseName) => {
  return exerciseImageCache[exerciseName] || null;
};
