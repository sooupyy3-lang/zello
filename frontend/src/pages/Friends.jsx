import { useState } from 'react';
import { HamburgerButton, HamburgerPanel } from '../pages/HamburgerMenu';
import { useNavigate } from 'react-router-dom';

// ── 더미 데이터 ──────────────────────────────────────
export const DUMMY_FRIENDS = [
  { id: 1, name: '훈남민성',   streak: 12, goal: '다이어트', todayDone: true,  color: '#BFE8F8' },
  { id: 2, name: '헬스걸',     streak: 8,  goal: '근력 강화', todayDone: true,  color: '#D4F1D4' },
  { id: 3, name: '집가고싶다', streak: 4,  goal: '유산소',    todayDone: false, color: '#FFE5C4' },
  { id: 4, name: '운동왕',     streak: 21, goal: '벌크업',    todayDone: true,  color: '#E8E0FF' },
  { id: 5, name: '새벽러너',   streak: 15, goal: '마라톤',    todayDone: true,  color: '#FFD6E0' },
];

// ── 아바타 ───────────────────────────────────────────
function Avatar({ name, color, size = 52.5 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontSize: size * 0.35, fontWeight: '700', color: '#002738',
    }}>
      {name[0]}
    </div>
  );
}

// ── 친구 카드 ────────────────────────────────────────
function FriendCard({ friend, onClick }) {
  return (
    <button
      onClick={() => onClick(friend)}
      style={{
        background: 'none', border: 'none',
        padding: '12px 0', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
      }}
    >
      <Avatar name={friend.name} color={friend.color} size={60} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: '700', color: '#333D4B' }}>{friend.name}</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8B95A1' }}>65분</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: '600', color: '#191F28' }}>450kcal</p>
      </div>
    </button>
  );
}

// ── 친구 팝업 ────────────────────────────────────────
function FriendPopup({ friend, onClose }) {
  if (!friend) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 100,
        animation: 'fadeIn 0.2s ease',
      }} />

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff',
        borderRadius: '24px 24px 0 0',
        zIndex: 101,
        padding: '0 0 40px',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        maxHeight: '70vh',
      }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>

        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 20px',
          borderBottom: '0.5px solid #F0F0F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={friend.name} color={friend.color} size={56} />
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: '700', color: '#002738' }}>{friend.name} 님</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8EB3C2' }}>{friend.streak}일째 운동 중</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 스탯 */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '오늘의 운동 시간', value: '65분' },
            { label: '총 소모 칼로리',   value: '450kcal' },
            { label: '시작 시간',         value: '오전 07:30' },
            { label: '종료 시간',         value: '오전 08:35' },
            { label: '최대 지속 시간',    value: `${friend.streak}일` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px' }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: '500', color: '#8E8E8E' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: '600', color: '#002738' }}>{value}</p>
            </div>
          ))}
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
export default function Friends() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>

      {/* ── 헤더 ── */}
<div style={{
  margin: '0 0 30px',
  padding: '0 20px',        
  backgroundColor: '#FFFFFF',
  display: 'flex', alignItems: 'center',
  position: 'relative',
  borderBottom: '1px solid #F0F0F0',
  height: '60px',
  boxSizing: 'border-box',
}}>
        <HamburgerButton onOpen={() => setMenuOpen(true)} />

        <h1 style={{
          position: 'absolute', left: 0, right: 0,
          textAlign: 'center', margin: 0,
          fontSize: 18, fontWeight: '700', color: '#333D4B',
          pointerEvents: 'none',
        }}>
          나의 친구들
        </h1>
      </div>

      {/* ── 친구 목록 그리드 ── */}
      <div style={{
        margin: '0 20px',
        padding: '20px 10px',
        backgroundColor: '#fff',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '16px 8px',
      }}>
        {DUMMY_FRIENDS.map(friend => (
          <FriendCard key={friend.id} friend={friend} onClick={setSelectedFriend} />
        ))}
      </div>

      {/* ── 친구 추가 버튼 ── */}
      <div style={{ position: 'absolute', right: 20, bottom: 30, zIndex: 99 }}>
  <button 
    onClick={() => navigate('/AddFriends')} // 3. 클릭 이벤트 추가 (경로는 App.js에 설정한 대로 입력)
    style={{
      width: 56, height: 56, borderRadius: '50%',
      backgroundColor: '#1E59DA', color: '#fff',
      border: 'none', boxShadow: '0 4px 4.5px rgba(0,0,0,0.25)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform 0.1s',
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
  >
    <svg width="32.7" height="32.7" viewBox="0 0 18 18" fill="none">
      <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </button>
</div>

      {menuOpen && (
        <HamburgerPanel userName="사용자" onClose={() => setMenuOpen(false)} />
      )}

      <FriendPopup friend={selectedFriend} onClose={() => setSelectedFriend(null)} />

    </div>
  );
}