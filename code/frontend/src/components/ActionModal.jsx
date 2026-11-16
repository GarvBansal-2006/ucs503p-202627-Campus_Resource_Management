function ActionModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;

  const isConfirm = modal.type === 'confirm';
  const isSuccess = modal.variant === 'success';
  const accent = isSuccess ? '#147d4b' : isConfirm ? '#b45309' : '#c53030';
  const softAccent = isSuccess ? '#e7f8ef' : isConfirm ? '#fff7ed' : '#fff0f0';

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'rgba(15, 23, 42, 0.52)', backdropFilter: 'blur(4px)' }}
    >
      <div role="dialog" aria-modal="true" style={{ width: 'min(440px, 100%)', backgroundColor: '#fff', borderRadius: '20px', padding: '30px', textAlign: 'center', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" aria-label="Close dialog" onClick={onClose} style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '24px', lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ width: '60px', height: '60px', margin: '-4px auto 16px', borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: softAccent, color: accent, fontSize: '28px', fontWeight: '800' }}>
          {isSuccess ? '✓' : isConfirm ? '?' : '!'}
        </div>
        <h2 style={{ margin: '0 0 10px', color: '#14205c', fontSize: '23px' }}>{modal.title}</h2>
        <p style={{ margin: '0 auto 24px', maxWidth: '350px', color: '#64748b', lineHeight: 1.55 }}>{modal.message}</p>
        {isConfirm ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>Keep open</button>
            <button type="button" onClick={onConfirm} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: '#1800ad', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Continue</button>
          </div>
        ) : (
          <button type="button" onClick={onClose} style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '10px', backgroundColor: '#1800ad', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Continue</button>
        )}
      </div>
    </div>
  );
}

export default ActionModal;
