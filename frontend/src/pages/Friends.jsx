import { useState } from 'react';

// ── 더미 데이터  ──────────────────
export const DUMMY_FRIENDS = [
  { id: 1, name: '훈남민성', streak: 12, goal: '다이어트', todayDone: true,  color: '#BFE8F8' },
  { id: 2, name: '헬스걸',   streak: 8,  goal: '근력 강화', todayDone: true,  color: '#D4F1D4' },
  { id: 3, name: '집가고싶다', streak: 4,  goal: '유산소',   todayDone: false, color: '#FFE5C4' },
  { id: 4, name: '운동왕',   streak: 21, goal: '벌크업',    todayDone: true,  color: '#E8E0FF' },
  { id: 5, name: '새벽러너', streak: 15, goal: '마라톤',    todayDone: true,  color: '#FFD6E0' },
    
];

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

// ── 친구 카드 ───────────────────────────────────────
function FriendCard({ friend, onClick }) {
  return (
    <button
      onClick={() => onClick(friend)}
      style={{
        background: 'none', border: 'none',
        padding: '12px 0', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', // 세로로 쌓기
        alignItems: 'center', // 가운데 정렬
        gap: 8,
      }}
    >
      {/* 1. 아바타 */}
      <div style={{ position: 'relative' }}>
        <Avatar name={friend.name} color={friend.color} size={60} />
        
        
      </div>

      {/* 텍스트 영역 */}
      <div style={{ textAlign: 'center' }}>
        {/* 2. 이름 */}
        <p style={{ margin: 0, fontSize: 14, fontWeight: '700', color: '#333D4B' }}>
          {friend.name}
        </p>
        {/* 3. 운동 시간 (더미 데이터 예시) */}
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8B95A1' }}>
          65분
        </p>
        {/* 4. 소모 칼로리 (더미 데이터 예시) */}
        <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: '600', color: '#191F28' }}>
          450kcal
        </p>
      </div>
    </button>
  );
}

// ── 하단 팝업 (Bottom Sheet) ────────────────────────
function FriendPopup({ friend, onClose }) {
  if (!friend) return null;

  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* 팝업 시트 */}
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
              <p style={{ margin: 0, fontSize: 17, fontWeight: '700', color: '#002738' }}>
                {friend.name} 님
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8EB3C2' }}>
                {friend.streak}일째 운동 중
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 정보 카드 */}
        <div style={{ padding: '20px 20px 0' }}>

          

          {/* 스탯 정보 (1열 세로 정렬) */}
<div style={{
  display: 'flex', 
  flexDirection: 'column', 
  gap: 10, 
  marginBottom: 20,
}}>
  {[
    { label: '오늘의 운동 시간', value: '65분',  },
    { label: '총 소모 칼로리', value: '450kcal',  },
    { label: '시작 시간', value: '오전 07:30',  },
    { label: '종료 시간', value: '오전 08:35', },
    { label: '최대 지속 시간', value: `${friend.streak}일` },
  ].map(({ label, value,  }) => (
    <div key={label} style={{
      backgroundColor: '#fff',
      padding: '12px 18px',
      display: 'flex',       
      alignItems: 'center', 
      gap: 16,  
      justifyContent: 'space-between',           
    }}>
      
      <p style={{ 
        margin: 0, 
        fontSize: '15px', 
        fontWeight: '500', 
        color: '#8E8E8E',
        textAlign: 'left' 
      }}>
        {label}
      </p>

      {/* 오른쪽 Value*/}
      <p style={{ 
        margin: 0, 
        fontSize: '15px', 
        fontWeight: '600', 
        color: '#002738',
        textAlign: 'right'
      }}>
        {value}
      </p>

      </div>
  ))}
</div>
        </div>
      </div>

      {/* 애니메이션 키프레임 */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── 메인 Friends 페이지 ─────────────────────────────
// ── 메인 Friends 페이지 ─────────────────────────────
export default function Friends() {
  const [selectedFriend, setSelectedFriend] = useState(null);

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative'
    }}>

      {/* ── 헤더 ── */}
<div style={{
  margin: '0px 0 30px',         
  padding: '30px 20px',      
  backgroundColor: '#FFFFFF', 
  display: 'flex',
  alignItems: 'center', 
  position: 'relative', // ⭐ h1의 기준점이 됨
  borderBottom: '1px solid #F0F0F0',
  height: '60px' // 헤더 높이를 고정해주면 더 깔끔합니다
}}>
  {/* 왼쪽 버튼: 자기 자리를 지킴 */}
  <button style={{
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, display: 'flex', alignItems: 'center',
    zIndex: 10 // 텍스트보다 위에 오도록 설정
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </button>

  {/* 중앙 제목: 부모 전체를 기준으로 중앙 배치 */}
  <h1 style={{ 
    position: 'absolute', // ⭐ 일반 흐름에서 제외
    left: 0, 
    right: 0, 
    textAlign: 'center',  // ⭐ 부모 너비 안에서 중앙 정렬
    margin: 0,            // 불필요한 마진 제거
    fontSize: 18,         // 이미지와 비슷한 크기
    fontWeight: '700', 
    color: '#333D4B',
    pointerEvents: 'none' // 제목이 버튼 클릭을 방해하지 않게 함
  }}>
    나의 친구들
  </h1>
</div>
      {/* ── 친구 목록 그리드  ── */}
      <div style={{
        margin: '0 20px',
        padding: '20px 10px',
        backgroundColor: '#fff',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr', // 4등분
        gap: '16px 8px', 
      }}>
        {DUMMY_FRIENDS.map(friend => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onClick={setSelectedFriend}
          />
        ))}
      </div>

     
    
      {/* ── 친구 추가 버튼  ── */}
<div style={{
  position: 'absolute', 
  right: 20,         
  bottom: 30,        
  zIndex: 99,        
}}>
  <button style={{
    width: 56, height: 56,           
    borderRadius: '50%',             
    backgroundColor: '#1E59DA',      
    color: '#fff',                    
    border: 'none',
    boxShadow: '0 4px 4.5px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* ── 팝업 ── */}
      <FriendPopup
        friend={selectedFriend}
        onClose={() => setSelectedFriend(null)}
      />
    </div>
  );
}
