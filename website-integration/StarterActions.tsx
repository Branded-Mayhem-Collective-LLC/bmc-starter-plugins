import { preparedConversation } from '../shared/links.mjs';

type Starter = 'ai-rescue' | 'workflow-test' | 'brand-velocity' | 'website-enquiry';
/** Existing website writer supplies shared-design-system classes. No local tokens or contact route. */
export function StarterActions({ starter, className = '', linkClassName = '' }: {
  starter: Starter; className?: string; linkClassName?: string;
}) {
  const actions = ['chatgpt', 'claude'].map(platform => preparedConversation(starter, platform));
  return <aside className={className} aria-label="Continue this check in your preferred assistant">
    <p>Start a prepared conversation with this check. Install the named starter separately when available.</p>
    <nav aria-label="Prepared conversations">
      {actions.map(action => <a key={action.label} className={linkClassName} href={action.url}
        target="_blank" rel="noopener noreferrer">{action.label}</a>)}
    </nav>
    <p>Use a permitted example. Keep private answers out of URLs.</p>
  </aside>;
}
