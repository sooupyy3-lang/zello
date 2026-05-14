import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeimg from '../assets/Icon/Close.svg';
// ── 더미 데이터 ──────────────────────────────────────
const DUMMY_GROUP = {
  name: '아침 런닝 크루',
};
export const DUMMY_FRIENDS = [
  { id: 1, name: '훈남민성', streak: 12, goal: '다이어트', todayDone: true, color: '#BFE8F8' },
  { id: 2, name: '헬스걸', streak: 8, goal: '근력 강화', todayDone: true, color: '#D4F1D4' },
  { id: 3, name: '집가고싶다', streak: 4, goal: '유산소', todayDone: false, color: '#FFE5C4' },
  { id: 4, name: '운동왕', streak: 21, goal: '벌크업', todayDone: true, color: '#E8E0FF' },
  { id: 5, name: '새벽러너', streak: 15, goal: '마라톤', todayDone: true, color: '#FFD6E0' },
];

// ── 컴포넌트: 아바타 ───────────────────────────────────────────
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

// ── 컴포넌트: 친구 카드 ────────────────────────────────────────
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

// ── 컴포넌트: 친구 상세 팝업 ────────────────────────────────────────
function FriendPopup({ friend, onClose }) {
  if (!friend) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff', borderRadius: '24px 24px 0 0',
        zIndex: 101, padding: '0 0 40px',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 20px', borderBottom: '0.5px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={friend.name} color={friend.color} size={56} />
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: '700', color: '#002738' }}>{friend.name} 님</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8EB3C2' }}>{friend.streak}일째 운동 중</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
        </div>
        <div style={{ padding: '10px 20px' }}>
             {/* 스탯 상세 내용 생략 (기존 코드와 동일) */}
             <p>오늘의 운동 시간: 65분</p>
        </div>
      </div>
    </>
  );
}

// ── 컴포넌트: 삭제 확인 모달 ────────────────────────────────────────
function DeleteModal({ groupName, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 9, padding: '32px 24px 24px',
        zIndex: 201, width: '75%', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700' }}>{groupName} 삭제</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1' }}>정말로 삭제하시겠습니까?<br/>
          삭제 후에는 복구할 수 없습니다.</p>
          

        <div style={{ padding: '0 20px',  gap: 20,display: 'flex',
      alignItems: 'center',  justifyContent: 'center', }}>
       {/* 취소 버튼 */}
            <button 
            onClick={onCancel} 
            style={{
              flex: 1, padding: '14px 0', backgroundColor: '#B0B8C1',
              color: '#FFFFFF', border: 'none', borderRadius: 12,
              fontSize: 17, fontWeight: '600', cursor: 'pointer',width: '120px', height: '43px',flexDirection:'column',display: 'flex',alignItems: 'center',  justifyContent: 'center',
            }}
          >
            취소
          </button>
          
          {/* '삭제' 버튼*/}
          <button 
            onClick={onConfirm} 
            style={{
              flex: 1, padding: '14px 0', backgroundColor: '#1E59DA',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 17, fontWeight: '600', cursor: 'pointer',width: '120px', height: '43px',flexDirection:'column',display: 'flex',alignItems: 'center',  justifyContent: 'center',
            }}
          >
            삭제
          </button>
      </div>
      </div>
    </>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function Groupdetail() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
const groupName = "하체 집중 모임";

  const handleDelete = () => {
    alert('삭제되었습니다.');
    setShowDeleteModal(false);
    navigate('/'); // 삭제 후 홈으로 이동
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F4', position: 'relative' }}>
      
      {/* ── 상단 헤더 영역 ── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0', paddingBottom: '80px' }}>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
          <h1 style={{ fontSize: 18, fontWeight: '700', color: '#333D4B', margin: 0 }}>{groupName}</h1>
        </div>

        {/* 그룹 소개 배너 */}
        <div style={{ margin: '0 20px 12px' }}>
          <div style={{ backgroundColor: '#EBF0FF', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: '600', color: '#1E59DA' }}>그룹 소개/규칙</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#1E59DA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{ padding: '0 20px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>{DUMMY_GROUP.desc}</p>
        </div>
      </div>

      {/* ── 친구 목록 그리드 ── */}
      <div style={{
        margin: '20px', padding: '20px 10px', backgroundColor: '#fff', borderRadius: 20,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 8px',
      }}>
        {DUMMY_FRIENDS.map(friend => (
          <FriendCard key={friend.id} friend={friend} onClick={setSelectedFriend} />
        ))}
      </div>

      {/* ── 삭제하기 버튼 ── */}
      <div style={{ padding: '20px' }}>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            width: '100%', padding: '15px 0', backgroundColor: '#1E59DA', color: '#fff',
            border: 'none', borderRadius: 14, fontSize: 16, fontWeight: '700', cursor: 'pointer',
          }}
        >
          모임 삭제하기
        </button>
      </div>

      {/* ── 모달 및 팝업 ── */}
      {showDeleteModal && (
        <DeleteModal 
          groupName={DUMMY_GROUP.name} 
          onConfirm={handleDelete} 
          onCancel={() => setShowDeleteModal(false)} 
        />
      )}

      {selectedFriend && (
        <FriendPopup friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}