import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HamburgerButton, HamburgerPanel } from '../pages/HamburgerMenu';
import { getMyGroups } from '../api';

function toViewGroup(g) {
  return {
    id: g.id,
    name: g.name,
    type: g.category,
    people: `${g.memberCount}/${g.maxMembers ?? '∞'}`,
    goal: g.goal,
    desc: g.description,
    inviteCode: g.inviteCode,
    myRole: g.myRole,
  };
}

// ── 그룹 카드 ─────────────────────────────────────────
function GroupCard({ group, onClick }) {
  return (
    <button
      onClick={() => onClick(group)}
      style={{
        width: '100%',height:`calc(150/874*100%)`, background: '#fff', border: 'none',
        borderRadius: 24, padding: '16px 20px', cursor: 'pointer',
        textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'transform 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>종목 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.type}</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
      </div>
    </button>
  );
}

// ── 그룹 미리보기 팝업 ────────────────────────────────
function GroupPopup({ group, onClose, onExplore }) {
  if (!group) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100, animation: 'fadeIn 0.2s ease' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff', borderRadius: '24px 24px 0 0',
        zIndex: 101, paddingBottom: 32,
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>

        {/* 모임 이름 */}
        <div style={{ padding: '14px 20px 10px' }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
        </div>

        <div style={{ 
          padding: '0 20px 16px', 
          display: 'flex', 
          gap: 24, 
          borderBottom: '1px solid #B0B8C1', // 구분선 
          marginBottom: 20
        }}>
          <span style={{ fontSize: 14, color: '#4E5968' }}>종목 <span style={{ color: '#8B95A1', marginLeft: 8 }}>{group.type}</span></span>
          <span style={{ fontSize: 14, color: '#4E5968' }}>인원 <span style={{ color: '#8B95A1', marginLeft: 8 }}>{group.people}</span></span>
          <span style={{ fontSize: 14, color: '#4E5968' }}>목표 <span style={{ color: '#8B95A1', marginLeft: 8 }}>{group.goal}</span></span>
        </div>

        {/* 그룹 소개/규칙 배너 */}
        <div style={{ padding: '0 20px 10px' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>그룹소개/규칙</p>
        </div>

        {/* 소개 텍스트 본문 */}
        <div style={{ padding: '0 20px 40px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', lineHeight: 1.6, wordBreak: 'break-all' }}>
            {group.desc || "소개 내용이 없습니다."}
          </p>
        </div>

        {/* 닫기 / 상세 보기 */}
        <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px 0', backgroundColor: '#F3F4F6',
            color: '#8B95A1', border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: '700', cursor: 'pointer',
          }}>닫기</button>
          <button onClick={() => onExplore(group)} style={{
            flex: 1, padding: '14px 0', backgroundColor: '#1E59DA',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: '700', cursor: 'pointer',
          }}>상세 보기</button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getMyGroups()
      .then(list => { if (!cancelled) setGroups((list ?? []).map(toViewGroup)); })
      .catch(e => { if (!cancelled) setError(e.message || '그룹 목록을 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleExplore = (group) => {
    setSelectedGroup(null);
    navigate('/Groupdetail', { state: { groupId: group.id, group } });
  };

  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* ── 헤더 ── */}
      <div style={{
        padding: '0 20px', backgroundColor: '#FFFFFF',
        display: 'flex', alignItems: 'center', position: 'relative',
        borderBottom: '1px solid #F0F0F0', height: '60px', boxSizing: 'border-box', flexShrink: 0,
      }}>
        <HamburgerButton onOpen={() => setMenuOpen(true)} />
        <h1 style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', pointerEvents: 'none',
        }}>나의 운동 모임</h1>
      </div>

      {/* ── 카드 목록 ── */}
      <div style={{ padding: '20px 20px 100px', flex: 1 }}>
        {loading && <p style={{ textAlign: 'center', fontSize: 13, color: '#8B95A1', padding: '20px 0' }}>불러오는 중...</p>}
        {!loading && error && <p style={{ textAlign: 'center', fontSize: 13, color: '#F04452', padding: '20px 0' }}>{error}</p>}
        {!loading && !error && groups.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#8B95A1', padding: '20px 0' }}>
            아직 가입한 모임이 없어요. 새 모임을 만들거나 찾아보세요.
          </p>
        )}
        {!loading && !error && groups.map(group => (
          <GroupCard key={group.id} group={group} onClick={setSelectedGroup} />
        ))}
      </div>

      {/* ── FAB ── */}
      <div style={{ position: 'absolute', right: 20, bottom: '5%', zIndex: 99 }}>
        <button
          onClick={() => navigate('/AddGroup')}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#1E59DA', color: '#fff', border: 'none',
            boxShadow: '0 4px 12px rgba(30,89,218,0.4)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && <HamburgerPanel userName="사용자" onClose={() => setMenuOpen(false)} />}
      <GroupPopup group={selectedGroup} onClose={() => setSelectedGroup(null)} onExplore={handleExplore} />
    </div>
  );
}