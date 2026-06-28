const EARTH_RADIUS_M = 6371000;
const DEFAULT_STRIDE_M = 0.762;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function requestGeolocationPermission() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is not supported'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export function createGpsStepCounter({
  onSteps,
  strideLength = DEFAULT_STRIDE_M,
  maxAccuracy = 30,
  minMoveMeters = 3,
  minSpeedMps = 0.35,
  maxSpeedMps = 3.8,
} = {}) {
  let watchId = null;
  let lastPoint = null;
  let lastTimestamp = null;
  let leftoverDistance = 0;

  const emitSteps = (count) => {
    if (count > 0) onSteps?.(count);
  };

  const handlePosition = (position) => {
    const { latitude, longitude, accuracy, speed } = position.coords;
    const timestamp = position.timestamp;

    if (accuracy == null || accuracy > maxAccuracy) return;

    if (!lastPoint) {
      lastPoint = { latitude, longitude };
      lastTimestamp = timestamp;
      return;
    }

    const distance = haversineMeters(
      lastPoint.latitude,
      lastPoint.longitude,
      latitude,
      longitude
    );

    const elapsedSeconds = (timestamp - lastTimestamp) / 1000;
    if (elapsedSeconds <= 0) return;

    const computedSpeed = distance / elapsedSeconds;
    const movementSpeed = speed != null && speed >= 0 ? speed : computedSpeed;

    if (
      distance < minMoveMeters ||
      movementSpeed < minSpeedMps ||
      movementSpeed > maxSpeedMps
    ) {
      return;
    }

    leftoverDistance += distance;
    const steps = Math.floor(leftoverDistance / strideLength);
    if (steps > 0) {
      leftoverDistance -= steps * strideLength;
      emitSteps(steps);
    }

    lastPoint = { latitude, longitude };
    lastTimestamp = timestamp;
  };

  const handleError = (error) => {
    console.error('GPS step counter error:', error);
  };

  return {
    start() {
      if (!navigator.geolocation || watchId != null) return false;

      lastPoint = null;
      lastTimestamp = null;
      leftoverDistance = 0;

      watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 20000,
      });

      return true;
    },
    stop() {
      if (watchId == null) return;
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      lastPoint = null;
      lastTimestamp = null;
      leftoverDistance = 0;
    },
  };
}
