import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  const IconComponent = Icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <IconComponent size={28} className="text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title || 'Nothing here'}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">{description}</p>}
      {action && action}
    </div>
  );
}
