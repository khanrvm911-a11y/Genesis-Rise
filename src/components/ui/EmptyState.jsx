export default function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div className={`rounded-xl border border-sl-purple/15 bg-sl-gray/20 text-center ${compact ? 'py-6' : 'p-6'}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-sl-gray/15 border border-sl-purple/10 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6 text-sl-purple-light/40" />
        </div>
      )}
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-sl-purple-light/60 max-w-xs mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
