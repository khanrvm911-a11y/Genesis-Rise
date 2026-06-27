import { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { useLevel } from '../../context/LevelContext';
import { usePowerLevel } from '../../context/PowerLevelContext';
import {
  getUserContext, loadConversations, saveConversations,
} from '../../utils/coachUtils';
import SmartRecommendations from './SmartRecommendations';
import WeeklyReview from './WeeklyReview';
import AIChat from './AIChat';
import ConversationHistory from './ConversationHistory';

const VIEWS = {
  CHAT: 'chat',
  RECOMMENDATIONS: 'recommendations',
  WEEKLY_REVIEW: 'weekly_review',
  HISTORY: 'history',
};

export default function AICoach() {
  const {
    workoutHistory, missionProgress, userSettings,
    personalRecords, exercises,
  } = useWorkout();
  const levelData = useLevel();
  const powerLevelData = usePowerLevel();

  const [view, setView] = useState(VIEWS.CHAT);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadConversations();
    setConversations(data.conversations);
    setActiveId(data.activeId);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveConversations({ conversations, activeId });
    }
  }, [conversations, activeId, loaded]);

  const ctx = useMemo(() => getUserContext(
    workoutHistory, missionProgress, levelData, powerLevelData,
    userSettings, personalRecords, exercises,
  ), [workoutHistory, missionProgress, levelData, powerLevelData, userSettings, personalRecords, exercises]);

  const renderView = () => {
    switch (view) {
      case VIEWS.RECOMMENDATIONS:
        return (
          <SmartRecommendations
            ctx={ctx}
            onBack={() => setView(VIEWS.CHAT)}
          />
        );
      case VIEWS.WEEKLY_REVIEW:
        return (
          <WeeklyReview
            ctx={ctx}
            onBack={() => setView(VIEWS.CHAT)}
          />
        );
      case VIEWS.CHAT:
        return (
          <AIChat
            ctx={ctx}
            conversations={conversations}
            setConversations={setConversations}
            activeId={activeId}
            setActiveId={setActiveId}
          />
        );
      case VIEWS.HISTORY:
        return (
          <ConversationHistory
            conversations={conversations}
            setConversations={setConversations}
            activeId={activeId}
            setActiveId={setActiveId}
            onBack={() => setView(VIEWS.CHAT)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sl-gradient flex flex-col">
      <div className="flex-1 px-4 py-4 md:py-6">
        <div className="mobile-container max-w-2xl mx-auto">
          <nav className="flex items-center justify-between mb-4" role="tablist" aria-label="Coach sections">
            <div className="flex items-center gap-4">
              <button onClick={() => setView(VIEWS.CHAT)}
                className={`text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 ${
                  view === VIEWS.CHAT ? 'text-sl-purple-light' : 'text-sl-purple-light/40 hover:text-sl-purple-light/60'
                }`}
                role="tab" aria-selected={view === VIEWS.CHAT}>
                <MessageSquare className="w-3 h-3" />
                Chat
              </button>
              <button onClick={() => setView(VIEWS.HISTORY)}
                className={`text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 ${
                  view === VIEWS.HISTORY ? 'text-sl-purple-light' : 'text-sl-purple-light/40 hover:text-sl-purple-light/60'
                }`}
                role="tab" aria-selected={view === VIEWS.HISTORY}>
                <Clock className="w-3 h-3" />
                History
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-sl-purple-light/50">
              <span className="hidden sm:inline">Level {ctx.level}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">{ctx.title}</span>
            </div>
          </nav>

          <div className="mobile-card p-4" role="tabpanel">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}
