import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 더미 데이터 ──────────────────────────────────────
const DUMMY_GROUP = {
  name: '하체 집중 모임',
  category: '헬스', 
  members: '3/8',   
  goal: '주 2회',    
  desc: '매일 아침 7시, 상쾌한 공기를 마시며 함께 뛰어요! 지각 시 벌금 1,000원입니다.'
};

export const DUMMY_FRIENDS = [
  { id: 1, name: '훈남민성', streak: 12, goal: '다이어트', todayDone: true, isWorkingOut: true, color: '#BFE8F8',
    rank: '1위', workoutTime: '1H 12M 13S', calories: '461 kcal', startTime: '09:34 AM', endTime: '10:34 AM', maxDuration: '41M 32S' }, 
  { id: 2, name: '헬스걸', streak: 8, goal: '근력 강화', todayDone: true, isWorkingOut: true, color: '#D4F1D4',
    rank: '2위', workoutTime: '58M 40S', calories: '390 kcal', startTime: '07:10 AM', endTime: '08:08 AM', maxDuration: '35M 12S' },
  { id: 3, name: '집가고싶다', streak: 4, goal: '유산소', todayDone: false, isWorkingOut: false, color: '#FFE5C4',
    rank: '-', workoutTime: '-', calories: '-', startTime: '-', endTime: '-', maxDuration: '-' },
  { id: 4, name: '운동왕', streak: 21, goal: '벌크업', todayDone: true, isWorkingOut: true, color: '#E8E0FF',
    rank: '3위', workoutTime: '47M 05S', calories: '355 kcal', startTime: '06:50 AM', endTime: '07:37 AM', maxDuration: '28M 44S' },
  { id: 5, name: '새벽러너', streak: 15, goal: '마라톤', todayDone: true, isWorkingOut: false, color: '#FFD6E0',
    rank: '4위', workoutTime: '52M 20S', calories: '410 kcal', startTime: '05:30 AM', endTime: '06:22 AM', maxDuration: '30M 08S' },
];

// ── 컴포넌트: 아바타 ──────────────────────────────────────────
function Avatar({ name, color, size = 52.5 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: size * 0.35, fontWeight: '700', color: '#002738',
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
        background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
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

// ── 컴포넌트: 친구 상세 팝업 ──────────────────
function FriendPopup({ friend, onClose, onKick }) {
  if (!friend) return null;
  const rows = [
    ['오늘의 운동 랭킹', friend.rank],
    ['오늘의 운동 시간', friend.workoutTime],
    ['총 소모 칼로리', friend.calories],
    ['시작 시간', friend.startTime],
    ['종료 시간', friend.endTime],
    ['최대 지속 시간', friend.maxDuration],
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 24, padding: '28px 24px 24px',
        zIndex: 201, width: '80%', border: '2px solid #8C6FF7',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#EDEBFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#B8AEEA" />
              <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#B8AEEA" />
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: 17, fontWeight: '700', color: '#191F28' }}>{friend.name}</p>
        </div>
        <div>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: 14, color: '#8B95A1' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: '700', color: '#191F28' }}>{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => onKick(friend)}
          style={{
            width: '100%', marginTop: 20, height: '43px', backgroundColor: '#F04452', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: '600', cursor: 'pointer',
          }}
        >내보내기</button>
      </div>
    </>
  );
}

// ── 컴포넌트: 내보내기 확인 모달────────────────────────────────────────
function KickModal({ friendName, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20, padding: '32px 24px 24px',
        zIndex: 201, width: '75%', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700' }}>{friendName} 내보내기</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1', lineHeight: 1.5 }}>
          정말로 내보내시겠습니까?<br/>내보낸 후에는 되돌릴 수 없습니다.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: '43px', backgroundColor: '#B0B8C1', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >취소</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: '43px', backgroundColor: '#1E59DA', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >내보내기</button>
        </div>
      </div>
    </>
  );
}

// ── 컴포넌트: 모임 설정 모달 ────────────────────────────────────────
function DeleteModal({ groupName, onDeleteClick, onDelegateClick, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20, padding: '32px 24px 24px',
        zIndex: 201, width: '75%', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700' }}>{groupName} 삭제</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1', lineHeight: 1.5 }}>
          모임삭제와 그룹장 권한 위임 중 
<br/>선택하세요.
           </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onDeleteClick} 
            style={{
              flex: 1, height: '43px', backgroundColor: '#B0B8C1', color: '#fff', 
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >그룹 삭제</button>
          <button 
            onClick={onDelegateClick} 
            style={{
              flex: 1, height: '43px', backgroundColor: '#1E59DA', color: '#fff', 
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >권한 위임</button>
        </div>
      </div>
    </>
  );
}
function DeleteConfirmModal({ groupName, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 300 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20, padding: '32px 24px 24px',
        zIndex: 301, width: '75%', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700' }}>{groupName} 삭제</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1', lineHeight: 1.5 }}>
          정말로 삭제하시겠습니까?<br/>삭제 후에는 되돌릴 수 없습니다.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: '43px', backgroundColor: '#B0B8C1', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >취소</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: '43px', backgroundColor: '#F04452', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >삭제</button>
        </div>
      </div>
    </>
  );
}
function ResultModal({ message, onConfirm }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConfirm();
    }, 1300);
   return () => clearTimeout(timer);
    }, []);
    return(
    <>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 400 }} />
      <div style={{
        position: 'absolute', top: '90%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex',
        width: '386px',
        height: '70px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '24px',
        border: '2px solid rgba(30, 89, 218, 0.18)',
        background: 'rgba(219, 233, 249, 0.84)',
        zIndex: 401,
      }}>
        <div style={{
          color: '#1E59DA',
          textAlign: 'center',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal',
        }}>
          {message}
        </div>
      </div>
    </>
  );
}
// ── 그룹 소개 상세 페이지  ──────
function GroupDetailView({ groupName, category, members, goal, desc, onSave, onClose }) {
  // 💡 true 일 땐 모임장(편집가능), false 일 땐 비소속(열람만 가능)
  const [isHost, setIsHost] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState(desc || '');

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 600, display: 'flex', flexDirection: 'column' }}>
      {/* 권한 테스트 바 (실제 연동 완료 후 제거하셔도 좋습니다) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 20px', backgroundColor: '#1E59DA', color: '#fff', fontSize: '11px' }}>
        <span>[테스트] 상단 스위치 :</span>
        <button onClick={() => { setIsHost(!isHost); setIsEditing(false); }} style={{ fontSize: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isHost ? '현재: 모임장' : '현재: 비소속 일반유저'}
        </button>
      </div>

      {/* 헤더 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', height: '56px', padding: '0 20px', position: 'relative' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 10L15 15" stroke="#333D4B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', margin: 0, fontSize: '16px', fontWeight: '700', color: '#000' }}>
          {groupName || '하체 집중 모임'}
        </p>
      </div>

      {/* 인포 라인 (종목, 인원, 목표) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E8EB', padding: '16px 20px', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>종목 <b style={{ color: '#333D4B' }}>{category || '헬스'}</b></span>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>인원 <b style={{ color: '#333D4B' }}>{members || '3/8 명'}</b></span>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>목표 <b style={{ color: '#333D4B' }}>{goal || '주 2회'}</b></span>
      </div>

      {/* 본문 영역 */}
      <div style={{ flex: 1, padding: '24px 20px', position: 'relative' }}>
        <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#000' }}>그룹 소개/규칙</p>

        {isEditing ? (
          <textarea
            value={tempDesc}
            onChange={e => setTempDesc(e.target.value)}
            style={{ width: '100%', height: '160px', border: '1px solid #1E59DA', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#000', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: '14px', color: '#4E5968', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {tempDesc || '내용이 없습니다.'}
          </p>
        )}

        {/* 모임장일 때만 편집/저장하기 플로팅 버튼을 노출 */}
        {isHost && (
          <button
            onClick={() => {
              if (isEditing) onSave(tempDesc);
              setIsEditing(!isEditing);
            }}
            style={{ position: 'absolute', right: '20px', bottom: '40px', padding: '12px 24px', backgroundColor: '#1E59DA', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {isEditing ? '저장하기' : '편집하기'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function Groupdetail() {
  const [friends, setFriends] = useState(DUMMY_FRIENDS); 
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [kickTarget, setKickTarget] = useState(null); 
 const [showSettingsModal, setShowSettingsModal] = useState(false); // 그룹 삭제/권한위임 선택 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 삭제 최종 확인 팝업  
  const [showDetail, setShowDetail] = useState(false); 
  const [desc, setDesc] = useState(DUMMY_GROUP.desc); 
  const [resultMessage, setResultMessage] = useState(null); 
  const navigate = useNavigate();
  const groupName = DUMMY_GROUP.name;
  const workingOutCount = friends.filter(f => f.isWorkingOut).length; 

  const handleDeleteClick = () => {
    setShowSettingsModal(false);
    setShowDeleteConfirm(true);
  };
 
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setResultMessage('삭제되었습니다.');
  };
 
  // "권한 위임" 버튼 → 완료 안내 팝업 표시
  const handleDelegateClick = () => {
    setShowSettingsModal(false);
    setResultMessage('권한이 위임되었습니다.');
  };
 
  const handleResultConfirm = () => {
    setResultMessage(null);
    navigate('/Group');
  };
 
  // 친구 내보내기 확정 처리
  const handleKickConfirm = () => {
    setFriends(prev => prev.filter(f => f.id !== kickTarget.id));
    setKickTarget(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f4f4f4' }}>
      
      {/* ── 상단 헤더 영역 ── */}
      <div style={{ 
        height: '149px', display: 'flex', alignItems: 'center', padding: '0 25px', position: 'relative' 
      }}>
       <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 1 }}>
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path d="M5 5L15 15M15 5L5 15" stroke="#333D4B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </button>
        <h1 style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', pointerEvents: 'none',
        }}>{groupName}</h1>
      </div>
      

        {/* 그룹 소개 영역: 클릭 시 상세페이지로 이동 */}
        <div onClick={() => setShowDetail(true)} style={{ margin: '0 20px', cursor: 'pointer' }}>
          <div style={{ 
            backgroundColor: '#DBE9F9', borderRadius: 12, padding: '14px 16px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <span style={{ fontSize: 14, fontWeight: '600', color: '#7AB8FF' }}>그룹 소개/규칙</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#7AB8FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

      {/* ── 현재 운동 중 인원 텍스트  ── */}
      <p style={{ margin: '20px 20px 0', fontSize: 13, fontWeight: '600', color: '#1E59DA' }}>
        지금 {workingOutCount}명이 운동 중이에요
      </p>

      {/* ── 친구 목록 그리드 ── */}
      <div style={{
        margin: '12px 20px 20px', padding: '20px 10px', backgroundColor: '#fff', borderRadius: 20,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 8px',
      }}>
        {friends.map(friend => (
          <FriendCard key={friend.id} friend={friend} onClick={setSelectedFriend} />
        ))}
      </div>

      {/* ── 설정하기 버튼 ── */}
      <div style={{ padding: '0 20px 40px', justifyContent: 'center', textAlign:'center', }}>
        <button
          onClick={() => setShowSettingsModal(true)}
          style={{
            width: '80%', padding: '15px 0', backgroundColor: '#1E59DA', color: '#FFFFFF',
            border: '1px solid #1E59DA', borderRadius: 14, fontSize: 16, fontWeight: '700', cursor: 'pointer',
          }}
        >
          모임 설정하기
        </button>
      </div>

      {/* ── 모달 및 팝업 ── */}
       {showSettingsModal && (
        <DeleteModal 
          groupName={groupName} 
          onDeleteClick={handleDeleteClick}
          onDelegateClick={handleDelegateClick}
          onCancel={() => setShowSettingsModal(false)} 
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          groupName={groupName}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {selectedFriend && (
        <FriendPopup
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onKick={(friend) => { setKickTarget(friend); setSelectedFriend(null); }} 
        />
      )}
      {resultMessage && (
  <ResultModal
    message={resultMessage}
    onConfirm={handleResultConfirm}
  />
)}

      {kickTarget && ( 
        <KickModal
          friendName={kickTarget.name}
          onConfirm={handleKickConfirm}
          onCancel={() => setKickTarget(null)}
        />
      )}

      {showDetail && ( 
        <GroupDetailView
          groupName={groupName}
          category={DUMMY_GROUP.category}
          members={DUMMY_GROUP.members}
          goal={DUMMY_GROUP.goal}
          desc={desc}
          onSave={setDesc}
          onClose={() => setShowDetail(false)}
        />
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}