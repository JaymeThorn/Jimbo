export const convertWeight = (weight, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight * 0.453592;
  }
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return weight * 2.20462;
  }
  return weight;
};

export const convertDistance = (distance, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return distance;
  
  if (fromUnit === 'km' && toUnit === 'mi') {
    return distance * 0.621371;
  }
  if (fromUnit === 'mi' && toUnit === 'km') {
    return distance * 1.60934;
  }
  return distance;
};

export const getWeightUnit = () => {
  return localStorage.getItem('weightUnit') || 'lbs';
};

export const getDistanceUnit = () => {
  return localStorage.getItem('distanceUnit') || 'km';
};

export const formatWeight = (weight) => {
  const unit = getWeightUnit();
  const converted = convertWeight(weight, 'lbs', unit);
  return `${converted.toFixed(1)} ${unit}`;
};

export const formatDistance = (distance) => {
  const unit = getDistanceUnit();
  const converted = convertDistance(distance, 'km', unit);
  return `${converted.toFixed(2)} ${unit}`;
};

export const formatPace = (pace) => {
  const mins = Math.floor(pace);
  const secs = Math.floor((pace % 1) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
