function FeedbackModal({ feedback, onClose }) {
  if (!feedback) return null;

  const isSuccess = feedback.variant === 'success';
  const accent = isSuccess ? '#147d4b' : '#c53030';
  const softAccent = isSuccess ? '#e7f8ef' : '#fff0f0';

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.52)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        style={{
          width: 'min(430px, 100%)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '24px', lineHeight: 1, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ width: '64px', height: '64px', margin: '-8px auto 18px', borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: softAccent, color: accent, fontSize: '32px', fontWeight: '800' }}>
          {isSuccess ? '✓' : '!'}
        </div>
        <p style={{ margin: 0, color: accent, fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {isSuccess ? 'Completed' : 'Action needed'}
        </p>
        <h2 id="feedback-title" style={{ margin: '8px 0 10px', color: '#14205c', fontSize: '24px' }}>
          {feedback.title}
        </h2>
        <p style={{ margin: '0 auto 24px', maxWidth: '340px', color: '#64748b', lineHeight: 1.6 }}>
          {feedback.message}
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '10px', backgroundColor: '#1800ad', color: '#ffffff', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default FeedbackModal;
