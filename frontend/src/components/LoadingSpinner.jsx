function LoadingSpinner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: '150px',
      zIndex: 9999,
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #002738',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoadingSpinner;
