import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Dumbbell, Flame, Activity, Zap, Heart,
  Star, Target, ChevronLeft, ChevronRight, CheckCircle2, Check, Sparkles, Ruler, Weight, Calendar
} from 'lucide-react';

const GOALS = [
  { value: 'Build Muscle', icon: Dumbbell, desc: 'Increase muscle mass and definition' },
  { value: 'Lose Fat', icon: Flame, desc: 'Reduce body fat and slim down' },
  { value: 'Improve Fitness', icon: Activity, desc: 'Boost overall health and endurance' },
  { value: 'Increase Strength', icon: Zap, desc: 'Build raw power and lifting capacity' },
  { value: 'Maintain Health', icon: Heart, desc: 'Stay active and feel great' },
];

const EXPERIENCE_LEVELS = [
  { value: 'Beginner', icon: Star, desc: 'New to regular exercise' },
  { value: 'Intermediate', icon: Target, desc: 'Some experience with training' },
  { value: 'Advanced', icon: Zap, desc: 'Experienced and consistent' },
];

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
};

function ProgressSteps({ current }) {
  const dataSteps = [1, 2, 3, 4];
  return (
    <div className="flex items-center justify-center gap-1.5 mb-3">
      {dataSteps.map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            s <= current
              ? 'w-8 bg-gradient-to-r from-sl-purple to-amber-500'
              : 'w-6 bg-sl-gray/40'
          }`}
        />
      ))}
      <span className="text-[10px] text-sl-gray-light/40 ml-2 font-medium">
        {current > 0 && current <= 4 ? `${current} of 4` : ''}
      </span>
    </div>
  );
}

function StepLayout({ stepNum, title, subtitle, children }) {
  return (
    <div className="py-2">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-sm text-sl-gray-light">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function FieldGroup({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-sl-gray-light/50 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[11px] text-sl-red mt-1">{error}</p>}
    </div>
  );
}

const OptionCard = memo(({ label, desc, icon: Icon, selected, value, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark ${
        selected
          ? 'bg-sl-purple/15 border-sl-purple/50 shadow-lg shadow-sl-purple/15'
          : 'bg-sl-gray/20 border-sl-gray/40 hover:border-sl-purple/30 hover:bg-sl-purple/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
          selected ? 'bg-gradient-to-br from-sl-purple to-amber-500 text-white shadow-lg shadow-sl-purple/20' : 'bg-sl-purple/10 text-sl-purple-light'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm transition-colors duration-300 ${
            selected ? 'text-white' : 'text-sl-gray-light'
          }`}>{label}</div>
          <div className="text-[11px] text-sl-gray-light/50 mt-0.5">{desc}</div>
        </div>
        {selected && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
      </div>
    </button>
  );
});

function NumberButton({ num, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold text-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark ${
        selected
          ? 'bg-gradient-to-br from-sl-purple to-amber-500 text-white shadow-lg shadow-sl-purple/20 scale-110'
          : 'bg-sl-gray/20 text-sl-gray-light border border-sl-gray/40 hover:border-sl-purple/30 hover:bg-sl-purple/5'
      }`}
    >
      {num}
    </button>
  );
}

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    goal: '',
    experience: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    age: '',
    workout_days: null,
  });
  const [heightUnit, setHeightUnit] = useState('cm');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const goNext = useCallback(() => {
    const newErrors = {};
    if (step === 1 && !form.goal) newErrors.goal = 'Select a fitness goal';
    if (step === 2 && !form.experience) newErrors.experience = 'Select your experience level';
    if (step === 3) {
      let heightOk = false;
      if (heightUnit === 'cm') {
        const h = parseFloat(form.height);
        if (form.height && !isNaN(h) && h >= 100 && h <= 250) heightOk = true;
      } else {
        const ft = parseInt(form.heightFeet, 10);
        const inc = parseInt(form.heightInches, 10);
        if (form.heightFeet && !isNaN(ft) && ft >= 3 && ft <= 8 && !isNaN(inc) && inc >= 0 && inc <= 11) heightOk = true;
      }
      if (!heightOk) newErrors.height = 'Enter a valid height (100–250 cm / 3–8 ft)';

      const w = parseFloat(form.weight);
      const a = parseInt(form.age, 10);
      if (!form.weight || isNaN(w) || w < 20 || w > 300) newErrors.weight = 'Enter a valid weight (20–300 kg)';
      if (!form.age || isNaN(a) || a < 13 || a > 100) newErrors.age = 'Enter a valid age (13–100)';
    }
    if (step === 4 && !form.workout_days) newErrors.workout_days = 'Select your weekly schedule';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setDir(1);
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, form, heightUnit]);

  const goBack = useCallback(() => {
    setDir(-1);
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const heightValue = heightUnit === 'cm'
        ? parseFloat(form.height)
        : parseInt(form.heightFeet, 10) * 30.48 + parseInt(form.heightInches, 10) * 2.54;

      const payload = {
        onboarding_completed: true,
        goal: form.goal,
        experience: form.experience,
        height_cm: Math.round(heightValue * 100) / 100,
        weight_kg: parseFloat(form.weight),
        age: parseInt(form.age, 10),
        workout_days: form.workout_days,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;
      onComplete();
    } catch (err) {
      setSaveError(
        err.details
          ? `Database error: ${err.message} (${err.details})`
          : err.message || 'Failed to save. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }, [form, user, onComplete, heightUnit]);

  function renderStep() {
    switch (step) {
      case 0: return WelcomeStep();
      case 1: return GoalStep();
      case 2: return ExperienceStep();
      case 3: return InfoStep();
      case 4: return ScheduleStep();
      case 5: return ConfirmStep();
      default: return null;
    }
  }

  function WelcomeStep() {
    return (
      <div className="text-center py-6 md:py-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sl-purple to-amber-500 flex items-center justify-center shadow-2xl shadow-sl-purple/30"
        >
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          Welcome to Genesis Rise
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm md:text-base text-sl-gray-light leading-relaxed max-w-sm mx-auto"
        >
          Let's personalize your fitness journey so Genesis Rise can guide you toward your goals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
            <button
            type="button"
            onClick={goNext}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sl-purple to-amber-500 text-white font-bold text-base rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sl-purple/25 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark min-h-[52px] min-w-[200px]"
          >
            <span className="relative z-10">Let's Get Started</span>
            <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-sl-purple via-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          </button>

        </motion.div>
      </div>
    );
  }

  function GoalStep() {
    return (
      <StepLayout
        stepNum={1}
        title="Your Goal"
        subtitle="Choose your primary fitness objective"
      >
        <div className="space-y-2.5">
          {GOALS.map((g) => (
            <OptionCard
              key={g.value}
              label={g.value}
              desc={g.desc}
              icon={g.icon}
              selected={form.goal === g.value}
              value={g.value}
              onSelect={(value) => {
                setForm((prev) => ({ ...prev, goal: value }));
                setErrors((prev) => ({ ...prev, goal: null }));
              }}
            />
          ))}
        </div>
        {errors.goal && <p className="text-xs text-sl-red mt-2">{errors.goal}</p>}
      </StepLayout>
    );
  }

  function ExperienceStep() {
    return (
      <StepLayout
        stepNum={2}
        title="Your Experience"
        subtitle="What's your current fitness experience?"
      >
        <div className="space-y-2.5">
          {EXPERIENCE_LEVELS.map((e) => (
            <OptionCard
              key={e.value}
              label={e.value}
              desc={e.desc}
              icon={e.icon}
              selected={form.experience === e.value}
              value={e.value}
              onSelect={(value) => update('experience', value)}
            />
          ))}
        </div>
        {errors.experience && <p className="text-xs text-sl-red mt-2">{errors.experience}</p>}
      </StepLayout>
    );
  }

  function InfoStep() {
    return (
      <StepLayout
        stepNum={3}
        title="Basic Information"
        subtitle="Help us tailor your experience"
      >
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label={
            <span className="flex items-center gap-2">
              <span>Height</span>
              <div className="flex rounded-lg overflow-hidden border border-sl-gray/40">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-2.5 py-0.5 text-[10px] font-medium transition-colors duration-200 ${
                    heightUnit === 'cm'
                      ? 'bg-sl-purple text-white'
                      : 'bg-transparent text-sl-gray-light/50 hover:text-sl-gray-light'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('ft')}
                  className={`px-2.5 py-0.5 text-[10px] font-medium transition-colors duration-200 ${
                    heightUnit === 'ft'
                      ? 'bg-sl-purple text-white'
                      : 'bg-transparent text-sl-gray-light/50 hover:text-sl-gray-light'
                  }`}
                >
                  ft+in
                </button>
              </div>
            </span>
          } error={errors.height}>
            {heightUnit === 'cm' ? (
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-purple-light/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="170"
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  className="w-full h-12 pl-10 pr-3 bg-sl-gray/20 border border-sl-gray/40 rounded-xl text-white text-sm placeholder-sl-gray-light/30 focus:outline-none focus:border-sl-purple/50 focus:ring-1 focus:ring-sl-purple/30 transition-all duration-300"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="5"
                    value={form.heightFeet}
                    onChange={(e) => update('heightFeet', e.target.value)}
                    className="w-full h-12 pl-3 pr-8 bg-sl-gray/20 border border-sl-gray/40 rounded-xl text-white text-sm placeholder-sl-gray-light/30 focus:outline-none focus:border-sl-purple/50 focus:ring-1 focus:ring-sl-purple/30 transition-all duration-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-sl-gray-light/40 pointer-events-none">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="10"
                    value={form.heightInches}
                    onChange={(e) => update('heightInches', e.target.value)}
                    className="w-full h-12 pl-3 pr-8 bg-sl-gray/20 border border-sl-gray/40 rounded-xl text-white text-sm placeholder-sl-gray-light/30 focus:outline-none focus:border-sl-purple/50 focus:ring-1 focus:ring-sl-purple/30 transition-all duration-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-sl-gray-light/40 pointer-events-none">in</span>
                </div>
              </div>
            )}
          </FieldGroup>

          <FieldGroup label="Weight (kg)" error={errors.weight}>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-purple-light/50 pointer-events-none" />
              <input
                type="text"
                placeholder="70"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
                className="w-full h-12 pl-10 pr-8 bg-sl-gray/20 border border-sl-gray/40 rounded-xl text-white text-sm placeholder-sl-gray-light/30 focus:outline-none focus:border-sl-purple/50 focus:ring-1 focus:ring-sl-purple/30 transition-all duration-300"
              />
            </div>
          </FieldGroup>

          <div className="col-span-2">
            <FieldGroup label="Age" error={errors.age}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-purple-light/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="21"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  className="w-full h-12 pl-10 pr-8 bg-sl-gray/20 border border-sl-gray/40 rounded-xl text-white text-sm placeholder-sl-gray-light/30 focus:outline-none focus:border-sl-purple/50 focus:ring-1 focus:ring-sl-purple/30 transition-all duration-300"
                />
              </div>
            </FieldGroup>
          </div>
        </div>
      </StepLayout>
    );
  }

  function ScheduleStep() {
    const days = [1, 2, 3, 4, 5, 6, 7];
    return (
      <StepLayout
        stepNum={4}
        title="Weekly Schedule"
        subtitle="How many days do you want to work out each week?"
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          {days.map((d) => (
            <NumberButton
              key={d}
              num={d}
              selected={form.workout_days === d}
              onClick={() => update('workout_days', d)}
            />
          ))}
        </div>
        {form.workout_days && (
          <p className="text-center text-xs text-sl-purple-light/60 mt-3">
            {form.workout_days} {form.workout_days === 1 ? 'day' : 'days'} per week
          </p>
        )}
        {errors.workout_days && <p className="text-xs text-sl-red text-center mt-2">{errors.workout_days}</p>}
      </StepLayout>
    );
  }

  function ConfirmStep() {
    let heightLabel;
    if (heightUnit === 'cm') {
      heightLabel = `${form.height} cm`;
    } else {
      heightLabel = `${form.heightFeet}ft ${form.heightInches}in`;
    }
    const summaryItems = [
      { label: 'Goal', value: form.goal },
      { label: 'Experience', value: form.experience },
      { label: 'Height', value: heightLabel },
      { label: 'Weight', value: `${form.weight} kg` },
      { label: 'Age', value: form.age },
      { label: 'Workout Days', value: `${form.workout_days} per week` },
    ];

    return (
      <div className="py-4 md:py-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-1">You're All Set</h2>
        <p className="text-sm text-sl-gray-light text-center mb-6">Here's your personalized plan</p>

        <div className="space-y-2 max-w-xs mx-auto">
          {summaryItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-sl-gray/20 border border-sl-gray/40"
            >
              <span className="text-xs text-sl-gray-light/60">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.value}</span>
            </motion.div>
          ))}
        </div>

        {saveError && (
          <p className="text-xs text-sl-red text-center mt-4">{saveError}</p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sl-purple to-amber-500 text-white font-bold text-base rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sl-purple/25 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark min-h-[52px] min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {saving ? (
              <span className="relative z-10">Saving...</span>
            ) : (
              <>
                <span className="relative z-10">Create My Journey</span>
                <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-sl-purple via-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  const showBack = step > 0 && step < 5;
  const showNext = step > 0 && step < 5;

  return (
    <div className="min-h-screen bg-sl-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-sl-gray/20 backdrop-blur-sm border border-sl-purple/10 rounded-2xl shadow-2xl shadow-sl-purple/10 p-5 md:p-8">
          {step > 0 && step <= 4 && <ProgressSteps current={step} />}

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {(showBack || showNext) && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-sl-purple/10">
              <div>
                {showBack && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-sl-gray-light hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>
              <div>
                {showNext && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-sl-purple to-amber-500 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-sl-purple/20 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}