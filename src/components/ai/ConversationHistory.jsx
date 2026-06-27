import { useState, useMemo } from 'react';
import {
  MessageSquare, Search, Trash2, ChevronRight, Clock,
  MessageCircle, X,
} from 'lucide-react';
import { searchConversations, deleteConversation, saveConversations } from '../../utils/coachUtils';
import EmptyState from '../ui/EmptyState';

export default function ConversationHistory({
  conversations, setConversations, activeId, setActiveId, onBack,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    return searchConversations(conversations, searchQuery);
  }, [conversations, searchQuery]);

  const handleDelete = (id) => {
    const updated = deleteConversation(conversations, id);
    const newActiveId = activeId === id ? null : activeId;
    saveConversations({ conversations: updated, activeId: newActiveId });
    setConversations(updated);
    setActiveId(newActiveId);
    setConfirmDelete(null);
  };

  const handleSelect = (id) => {
    setActiveId(id);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sl-purple-light" />
          History
        </h2>
        <button onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
          Back
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sl-purple-light/40" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full h-10 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-sm text-white placeholder-sl-purple-light/30 pl-9 pr-3 focus:outline-none focus:border-sl-purple/40 transition" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sl-purple-light/40 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={MessageCircle}
          title={searchQuery ? 'No matching conversations' : 'No conversations yet'}
          description={searchQuery ? 'Try a different search term' : 'Start a chat to begin'}
          compact />
      )}

      <div className="space-y-1.5" role="list" aria-label="Conversation history">
        {filtered.map(conv => (
          <div key={conv.id}
            className={`rounded-xl border transition group ${
              activeId === conv.id
                ? 'border-sl-purple/40 bg-sl-purple/10'
                : 'border-sl-purple/15 bg-sl-gray/20 hover:bg-sl-gray/30'
            }`}>
            <button onClick={() => handleSelect(conv.id)}
              className="w-full flex items-center justify-between p-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <MessageCircle className="w-4 h-4 text-sl-purple-light/60 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{conv.title}</p>
                  <p className="text-[10px] text-sl-purple-light/50 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(conv.updatedAt || conv.createdAt)}
                    <span className="mx-1">&middot;</span>
                    {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {confirmDelete === conv.id ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                      className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                      className="w-7 h-7 rounded-lg bg-sl-gray/40 border border-sl-purple/15 flex items-center justify-center text-sl-purple-light/60 hover:text-white transition text-[10px] font-bold">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(conv.id); }}
                      className="w-7 h-7 rounded-lg bg-sl-gray/30 border border-sl-purple/10 flex items-center justify-center text-sl-purple-light/40 hover:text-red-400 hover:border-red-500/30 transition opacity-0 group-hover:opacity-100"
                      aria-label={`Delete ${conv.title}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-sl-purple-light/30" />
                  </>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
