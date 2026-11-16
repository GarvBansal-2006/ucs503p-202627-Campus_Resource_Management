function BatchSelector({ batches = [], selectedBatches = [], onChange }) {
  const options = batches.map(batch => (
    typeof batch === 'string'
      ? { name: batch, studentCount: null }
      : { name: batch.name, studentCount: batch.studentCount }
  ));

  const toggleBatch = (batchName) => {
    if (selectedBatches.includes(batchName)) {
      onChange(selectedBatches.filter(batch => batch !== batchName));
    } else {
      onChange([...selectedBatches, batchName]);
    }
  };

  const allSelected = options.length > 0 && options.every(batch => selectedBatches.includes(batch.name));

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', marginTop: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#475569' }}>
          Select every batch attending this shared activity.
        </span>
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => onChange(allSelected ? [] : options.map(batch => batch.name))}
            style={{ border: 'none', background: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        )}
      </div>

      {options.length === 0 ? (
        <p style={{ margin: 0, color: '#b45309', fontSize: '13px' }}>
          No student batches are available yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
          {options.map(batch => (
            <label key={batch.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#334155' }}>
              <input
                type="checkbox"
                checked={selectedBatches.includes(batch.name)}
                onChange={() => toggleBatch(batch.name)}
              />
              {batch.name}
              {batch.studentCount !== null ? ` (${batch.studentCount} students)` : ''}
            </label>
          ))}
        </div>
      )}

      <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '12px' }}>
        Selected: {selectedBatches.length}
      </p>
    </div>
  );
}

export default BatchSelector;
