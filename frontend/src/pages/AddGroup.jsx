import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 더미 데이터 ──────────────────────────────────────
const DUMMY_ALL_GROUPS = [
  { id: 1, name: '하체 집중 모임',  type: '헬스',     people: '3/8',  goal: '주 2회', createdAt: 1, attendance: 90, memberCount: 3,  desc: '이피구 저피구구 아라아라' },
  { id: 2, name: '새벽 러닝 크루',  type: '러닝',     people: '5/10', goal: '주 3회', createdAt: 2, attendance: 85, memberCount: 5,  desc: '매일 새벽 한강에서 함께 달려요!' },
  { id: 3, name: '요가 힐링 모임',  type: '요가',     people: '4/6',  goal: '주 2회', createdAt: 3, attendance: 92, memberCount: 4,  desc: '몸과 마음을 함께 가꾸는 요가 모임입니다.' },
  { id: 4, name: '주말 등산 클럽',  type: '등산',     people: '6/12', goal: '주 1회', createdAt: 4, attendance: 78, memberCount: 6,  desc: '주말마다 서울 근교 산을 함께 오릅니다.' },
  { id: 5, name: '크로스핏 팀',     type: '크로스핏', people: '2/8',  goal: '주 4회', createdAt: 5, attendance: 88, memberCount: 2,  desc: '강도 높은 트레이닝을 함께해요.' },
  { id: 6, name: '수영 마스터즈',   type: '수영',     people: '7/10', goal: '주 3회', createdAt: 6, attendance: 95, memberCount: 7,  desc: '수영 실력을 함께 키워가는 모임입니다.' },
];

const TABS = [
  { key: 'recent',     label: '최신순', sort: (a, b) => b.createdAt - a.createdAt },
  { key: 'attendance', label: '출석순', sort: (a, b) => b.attendance - a.attendance },
  { key: 'members',    label: '인원순', sort: (a, b) => b.memberCount - a.memberCount },
];

// ── 그룹 미리보기 팝업 (닫기 / 둘러보기) ─────────────
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

        {/* 정보 행 */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>종목 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.type}</span></span>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
        </div>

        {/* 그룹 소개/규칙 배너 */}
        <div style={{ margin: '0 20px 16px' }}>
          <div style={{
            backgroundColor: '#EBF0FF', borderRadius: 12, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: '600', color: '#1E59DA' }}>그룹 소개/규칙</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#1E59DA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* 소개 텍스트 */}
        <div style={{ padding: '0 20px 24px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>{group.desc}</p>
        </div>

        {/* 닫기 / 둘러보기 */}
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
          }}>둘러보기</button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

// ── 검색 모달 (풀스크린) ──────────────────────────────
function SearchModal({ onClose, onSelectGroup }) {
  const [query, setQuery] = useState('');
  const results = query.length > 0
    ? DUMMY_ALL_GROUPS.filter(g => g.name.includes(query) || g.type.includes(query))
    : [];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: '#F3F4F4',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.18s ease',
    }}>
      {/* 검색 헤더 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        {/* 검색 인풋 박스 */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: '#F3F4F6', borderRadius: 12, padding: '11px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#8B95A1" strokeWidth="1.8" />
            <path d="M13.5 13.5L17 17" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="모임 이름, 종목 검색"
            style={{
              flex: 1, border: 'none', background: 'none',
              fontSize: 15, color: '#191F28', outline: 'none',
            }}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#C9CDD4" />
                <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {/* 취소 */}
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: '600', color: '#8B95A1', padding: 0, whiteSpace: 'nowrap',
        }}>취소</button>
      </div>

      {/* 결과 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {query.length === 0 ? (
          /* 초기 상태 - 안내 문구 */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="22" cy="22" r="14" stroke="#D1D6DB" strokeWidth="2.5" />
              <path d="M32 32L42 42" stroke="#D1D6DB" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 15, color: '#B0B8C1', fontWeight: '500' }}>모임 이름이나 종목으로 검색하세요</p>
          </div>
        ) : results.length === 0 ? (
          /* 결과 없음 */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="22" cy="22" r="14" stroke="#D1D6DB" strokeWidth="2.5" />
              <path d="M32 32L42 42" stroke="#D1D6DB" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M17 22H27M22 17V27" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 15, color: '#B0B8C1', fontWeight: '500' }}>'{query}'에 대한 결과가 없습니다</p>
          </div>
        ) : (
          /* 검색 결과 카드 목록 */
          results.map(group => (
            <button
              key={group.id}
              onClick={() => { onClose(); onSelectGroup(group); }}
              style={{
                width: '100%', background: '#fff', border: 'none',
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                textAlign: 'left', marginBottom: 10,
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: 6,
                boxSizing: 'border-box',
                transition: 'transform 0.12s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* 종목 뱃지 */}
                <span style={{
                  fontSize: 11, fontWeight: '700', color: '#1E59DA',
                  backgroundColor: '#EBF0FF', borderRadius: 6, padding: '2px 8px',
                }}>{group.type}</span>
                <p style={{ margin: 0, fontSize: 15, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 12, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
                <span style={{ fontSize: 12, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
              </div>
            </button>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── 그룹 카드 (참여 버튼 없음) ──────────────────────
function GroupCard({ group, onClick }) {
  return (
    <button
      onClick={() => onClick(group)}
      style={{
        width: '100%', background: '#fff', border: 'none',
        borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
        textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'transform 0.15s', boxSizing: 'border-box',
      }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>종목 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.type}</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
      </div>
    </button>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function AddGroup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recent');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const currentTab = TABS.find(t => t.key === activeTab);
  const sorted = [...DUMMY_ALL_GROUPS].sort(currentTab.sort);

  const handleExplore = (group) => {
    setSelectedGroup(null);
    navigate('/GroupExplore', { state: { group } });
  };

  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* ── 헤더 ── */}
      <div style={{
        padding: '0 20px', backgroundColor: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F0F0F0', height: '60px', boxSizing: 'border-box', flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B' }}>운동 모임 찾기</h1>
        <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 4px 8px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#333D4B" strokeWidth="1.8" />
            <path d="M13.5 13.5L17 17" stroke="#333D4B" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── 탭 ── */}
      <div style={{ backgroundColor: '#fff', display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: activeTab === tab.key ? '700' : '500',
            color: activeTab === tab.key ? '#1E59DA' : '#8B95A1',
            borderBottom: activeTab === tab.key ? '2px solid #1E59DA' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── 그룹 목록 ── */}
      <div style={{ padding: '16px 20px 100px', flex: 1 }}>
        {sorted.map(group => (
          <GroupCard key={group.id} group={group} onClick={setSelectedGroup} />
        ))}
      </div>

      {/* ── FAB ── */}
      <div style={{ position: 'absolute', right: 20, bottom: '5%', zIndex: 99 }}>
        <button style={{
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

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onSelectGroup={setSelectedGroup} />}
      <GroupPopup group={selectedGroup} onClose={() => setSelectedGroup(null)} onExplore={handleExplore} />
    </div>
  );
}