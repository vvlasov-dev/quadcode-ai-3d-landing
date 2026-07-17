type Props = { kind: 'privacy' | 'terms' | null; onClose: () => void };

export default function LegalModal({ kind, onClose }: Props) {
  if (!kind) return null;
  const title = kind === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="legal-head">
          <div className="title">{title}</div>
          <button className="legal-close" aria-label="Close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="#33333d" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="legal-body">
          <div className="meta">Effective: July 2026 · Early access preview</div>
          {kind === 'privacy' ? (
            <>
              <p><strong>What we collect.</strong> The email address you submit for early access, and basic anonymous usage analytics (page views, device class). Nothing else.</p>
              <p><strong>How we use it.</strong> Solely to send your invite and product updates about Quadcode AI. No spam, one-click unsubscribe in every email.</p>
              <p><strong>What we never do.</strong> We do not sell, rent or share your data with third parties for marketing. Your prompts and generated assets stay yours.</p>
              <p><strong>Storage & removal.</strong> Data is stored on EU servers. Email hello@quadcode.ai to have everything about you deleted within 30 days.</p>
            </>
          ) : (
            <>
              <p><strong>The service.</strong> Quadcode AI is provided as an early-access preview. Features may change, break or be removed while we build.</p>
              <p><strong>Your work is yours.</strong> You keep all rights to prompts you write and assets you generate, to the extent permitted by law.</p>
              <p><strong>Fair use.</strong> Don&rsquo;t use the service to create unlawful content, infringe others&rsquo; IP, or overload the infrastructure.</p>
              <p><strong>No warranty.</strong> The preview is provided &ldquo;as is&rdquo;, without warranties of any kind; our liability is limited to the amount you paid for it (currently zero).</p>
              <p><strong>Questions.</strong> hello@quadcode.ai</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
