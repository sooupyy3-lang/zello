import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Backimg from '../assets/Icon/BackForward.svg';
import { getCoachingHistory, applyCoachingRoutine } from '../api';

const COLORS = {
  primary: '#1E59DA',
};



// 체형(이미지) 기반인지 운동 데이터(텍스트) 기반인지 판별
function resolveRoutineType(log) {
  return log.imageUrl ? '체형 기반 추천루틴' : '운동 루틴 기반 추천루틴';
}

function parseRoutines(log) {
  try {
    if (log.recommendedRoutine) {
      const parsed = JSON.parse(log.recommendedRoutine);
      return parsed.routines || [];
    }
  } catch (e) {
    // 파싱 실패 시 빈 배열
  }
  return log.routines ?? [];
}

// 카드 상단 제목 (루틴 제목/카테고리). 필드가 없으면 기본값 사용
function resolveTitle(log, routines) {
  return log.routineTitle || log.title || log.category || routines[0]?.name || '추천 루틴';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ── 루틴 이력 카드 ─────────────────────────────────────
function RoutineCard({ log, onApply, applying }) {
  const routines = parseRoutines(log);
  const typeLabel = resolveRoutineType(log);
  const title = resolveTitle(log, routines);
  const date = formatDate(log.createdAt);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <p style={styles.typeLabel}>{typeLabel}</p>
          <p style={styles.cardTitle}>{title}</p>
        </div>
        <button
          onClick={() => onApply(log)}
          disabled={applying}
          style={styles.applyBtn}
        >
          {applying ? '연동 중...' : '+ 불러오기'}
        </button>
      </div>

      {date && <p style={styles.cardDate}>{date}</p>}

      {routines.length === 0 ? (
        <p style={styles.emptyText}>루틴 정보가 없어요.</p>
      ) : (
        <div style={styles.chipRow}>
          {routines.map((r, i) => (
            <div key={i} style={styles.chip}>
              <span style={styles.chipName}>{r.name}</span>
              {r.sets && <span style={styles.chipDetail}>{r.sets}</span>}
              {r.reps && <span style={styles.chipDetail}>{r.reps}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 연동 완료 토스트 ───────────────────────────────────
function Toast({ message }) {
  return (
    <div style={styles.toastWrap}>
      <div style={styles.toast}>
        <span style={styles.toastText}>{message}</span>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function AiHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCoachingHistory()
      .then(list => {
        if (cancelled) return;
        const sorted = [...(list ?? [])].sort(
          (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
        );
        setLogs(sorted);
      })
      .catch(e => { if (!cancelled) setError(e.message || '이력을 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleApply = async (log) => {
    const logId = log.id ?? log.logId;
    if (!logId || applyingId) return;
    setApplyingId(logId);
    try {
      await applyCoachingRoutine(logId);
      setToast('루틴이 연동되었어요!');
    } catch (e) {
      alert(e.message || '루틴 연동에 실패했어요.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* ── 헤더 ── */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <img src={Backimg} alt="back" style={{ width: 24, height: 24, opacity: 0.4 }} />
        </button>
        <h1 style={styles.headerTitle}>AI 코칭 이력</h1>
      </div>

      {/* ── 목록 ── */}
      <div style={styles.list}>
        {loading && <p style={styles.stateText}>불러오는 중...</p>}
        {!loading && error && (
          <p style={{ ...styles.stateText, color: '#F04452' }}>{error}</p>
        )}
        {!loading && !error && logs.length === 0 && (
          <p style={styles.stateText}>아직 AI 코칭 이력이 없어요.</p>
        )}
        {!loading && !error && logs.map((log, i) => (
          <RoutineCard
            key={log.id ?? log.logId ?? i}
            log={log}
            onApply={handleApply}
            applying={applyingId === (log.id ?? log.logId)}
          />
        ))}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%', minHeight: '100dvh', backgroundColor: '#E9EAEF',
    display: 'flex', flexDirection: 'column', position: 'relative',
  },
  header: {
    display: 'flex', alignItems: 'center', height: '60px',
    padding: '0 20px', position: 'relative', flexShrink: 0,
    backgroundColor: '#E9EAEF',
  },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', pointerEvents: 'none',
  },
  list: {
    padding: '4px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16,
  },
  stateText: {
    textAlign: 'center', fontSize: 13, color: '#8B95A1', padding: '40px 0',
  },
  card: {
    backgroundColor: '#F9F9F9', borderRadius: 24, padding: '24px 20px 20px',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
  },
  typeLabel: {
    margin: '0 0 4px', fontSize: 12, fontWeight: '600', color: '#8B95A1',
  },
  cardTitle: {
    margin: 0, fontSize: 20, fontWeight: '700', color: '#1E1E1E',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  cardDate: {
    margin: '4px 0 0', fontSize: 11, color: '#B0B8C1',
  },
  applyBtn: {
    flexShrink: 0, padding: '4px 8px', fontSize: 12, fontWeight: '600',
    color: '#4E5968', backgroundColor: '#E9EAEF', border: 'none',
    borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  emptyText: {
    marginTop: 16, fontSize: 12, color: '#B0B8C1', textAlign: 'center',
  },
  chipRow: {
    display: 'flex', gap: 12, overflowX: 'auto', marginTop: 24, paddingBottom: 4,
  },
  chip: {
    flexShrink: 0, width: 80, height: 80, borderRadius: '50%',
    backgroundColor: '#DBE9F9', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 1, textAlign: 'center', padding: 4,
    boxSizing: 'border-box',
  },
  chipName: {
    fontSize: 10, fontWeight: '700', color: '#1E59DA', lineHeight: 1.3,
  },
  chipDetail: {
    fontSize: 9, color: '#1E59DA', lineHeight: 1.3,
  },
  toastWrap: {
    position: 'absolute', left: 0, right: 0, bottom: '8%', display: 'flex',
    justifyContent: 'center', zIndex: 400, pointerEvents: 'none',
  },
  toast: {
    backgroundColor: 'rgba(219, 233, 249, 0.92)', border: '2px solid rgba(30, 89, 218, 0.18)',
    borderRadius: 24, padding: '18px 32px',
  },
  toastText: {
    color: '#1E59DA', fontSize: 15, fontWeight: '600', textAlign: 'center',
  },
};