const LOW_PASS_ALPHA = 0.12;
const STEP_THRESHOLD = 3.2;
const MIN_STEP_INTERVAL = 220;
const REST_THRESHOLD = 1.0;
const REST_SECONDS = 2.0;

export function requestMotionPermission() {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    return DeviceMotionEvent.requestPermission();
  }
  return Promise.resolve('granted');
}

export function createStepCounter({ onSteps } = {}) {
  let isRunning = false;
  let gX = 0, gY = 0, gZ = 0;
  let lastStepTime = 0;
  let stepCount = 0;
  let wasAbove = false;
  let restStart = null;
  let hasInitialGravity = false;
  let gravitySampleCount = 0;
  const GRAVITY_SAMPLES = 10;

  const handleMotion = (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    if (!hasInitialGravity) {
      gX += x;
      gY += y;
      gZ += z;
      gravitySampleCount++;
      if (gravitySampleCount >= GRAVITY_SAMPLES) {
        gX /= GRAVITY_SAMPLES;
        gY /= GRAVITY_SAMPLES;
        gZ /= GRAVITY_SAMPLES;
        hasInitialGravity = true;
      }
      return;
    }

    gX = gX * (1 - LOW_PASS_ALPHA) + x * LOW_PASS_ALPHA;
    gY = gY * (1 - LOW_PASS_ALPHA) + y * LOW_PASS_ALPHA;
    gZ = gZ * (1 - LOW_PASS_ALPHA) + z * LOW_PASS_ALPHA;

    const lx = x - gX;
    const ly = y - gY;
    const lz = z - gZ;

    const magnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

    const now = Date.now();

    if (magnitude < REST_THRESHOLD) {
      if (restStart === null) restStart = now;
      wasAbove = false;
      return;
    }
    restStart = null;

    if (magnitude > STEP_THRESHOLD && !wasAbove) {
      wasAbove = true;
      if (now - lastStepTime > MIN_STEP_INTERVAL) {
        lastStepTime = now;
        stepCount++;
        onSteps?.(1);
      }
    } else if (magnitude <= STEP_THRESHOLD && wasAbove) {
      wasAbove = false;
    }
  };

  return {
    start() {
      if (isRunning) return true;
      if (!window.DeviceMotionEvent) return false;

      gX = 0; gY = 0; gZ = 0;
      lastStepTime = 0;
      stepCount = 0;
      wasAbove = false;
      restStart = null;
      hasInitialGravity = false;
      gravitySampleCount = 0;

      window.addEventListener('devicemotion', handleMotion);
      isRunning = true;
      return true;
    },
    stop() {
      if (!isRunning) return;
      window.removeEventListener('devicemotion', handleMotion);
      isRunning = false;
      stepCount = 0;
    },
  };
}
