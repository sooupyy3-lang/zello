import { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGroup, updateGroup, kickGroupMember, leaveGroup, getUserId, getGroupActiveMembers, deleteGroup, delegateGroupOwner } from '../api';
const AVATAR_COLORS = ['#BFE8F8', '#D4F1D4', '#FFE5C4', '#E8E0FF', '#FFD6E0'];

// GroupResponse.members(MemberInfo) → 화면에서 쓰는 friend 카드 형태로 변환
function toViewMembers(members) {
  return (members ?? []).map((m, i) => ({
    id: m.userId,
    name: m.name,
    role: m.role, // 'owner' | 'member'
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));
}

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
        <p style={{ margin: '4px 0 0', fontSize: 12, color: friend.role === 'owner' ? '#1E59DA' : '#8B95A1' }}>
          {friend.role === 'owner' ? '모임장' : '멤버'}
        </p>
      </div>
    </button>
  );
}

// ── 컴포넌트: 친구 상세 팝업 ──────────────────
function FriendPopup({ friend, onClose, onKick, canKick }) {
  if (!friend) return null;
  const rows = [
    ['역할', friend.role === 'owner' ? '모임장' : '멤버'],

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
        {canKick && (
          <button
            onClick={() => onKick(friend)}
            style={{
              width: '100%', marginTop: 20, height: '43px', backgroundColor: '#F04452', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: '600', cursor: 'pointer',
            }}
          >내보내기</button>
        )}
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
function DelegateModal({ members, onSelect, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 300 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20, padding: '24px', zIndex: 301, width: '80%', maxHeight: '60%', overflowY: 'auto',
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 17, fontWeight: '700', textAlign: 'center' }}>권한을 위임할 멤버 선택</p>
        {members.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#8B95A1' }}>위임할 다른 멤버가 없어요.</p>
        )}
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            style={{
              width: '100%', padding: '12px 8px', display: 'flex', alignItems: 'center', gap: 12,
              background: 'none', border: 'none', borderBottom: '1px solid #F0F0F0', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <Avatar name={m.name} color={m.color} size={36} />
            <span style={{ fontSize: 14, fontWeight: '600', color: '#333D4B' }}>{m.name}</span>
          </button>
        ))}
        <button onClick={onCancel} style={{ marginTop: 16, width: '100%', padding: '12px 0', border: 'none', borderRadius: 12, backgroundColor: '#B0B8C1', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>취소</button>
      </div>
    </>
  );
}
function LeaveConfirmModal({ groupName, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 300 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20, padding: '32px 24px 24px',
        zIndex: 301, width: '75%', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700' }}>{groupName} 나가기</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1', lineHeight: 1.5 }}>
          정말로 모임을 나가시겠습니까?<br/>나간 후에는 되돌릴 수 없습니다.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, height: '43px', backgroundColor: '#B0B8C1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>취소</button>
          <button onClick={onConfirm} style={{ flex: 1, height: '43px', backgroundColor: '#F04452', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>나가기</button>
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
function GroupDetailView({ groupName, category, members, goal, desc, isHost, onSave, onClose }) {  
  const [isEditing, setIsEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState(desc || '');

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 600, display: 'flex', flexDirection: 'column' }}>
    

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
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId ?? location.state?.group?.id;

  const [group, setGroup] = useState(location.state?.group ?? null);
  const [friends, setFriends] = useState(toViewMembers(location.state?.group?.members));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [kickTarget, setKickTarget] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // 모임 나가기 확인 모달
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [activeUserIds, setActiveUserIds] = useState(null);

  const groupName = group?.name ?? '';
  const isHost = group?.myRole === 'owner';
  const myUserId = Number(getUserId());
  

  useEffect(() => {
    if (!groupId) {
      setError('그룹 정보를 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getGroup(groupId)
      .then(g => {
        if (cancelled) return;
        setGroup(g);
        setFriends(toViewMembers(g.members));

        getGroupActiveMembers(groupId)
          .then(list => {
            if (cancelled) return;
            setActiveUserIds(new Set((list ?? []).map(a => a.userId)));
          })
          .catch(() => { /* 아직 지원 안 함 — 조용히 무시 */ });
      })
      .catch(e => { if (!cancelled) setError(e.message || '그룹 정보를 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [groupId]);

  // "모임 설정하기" → 나가기 확인
  const handleLeaveConfirm = async () => {
    setShowSettingsModal(false);
    try {
      await leaveGroup(groupId);
      setResultMessage('모임에서 나갔습니다.');
    } catch (e) {
      alert(e.message || '나가기에 실패했어요.');
    }
  };
  const handleDeleteClick = () => {
    setShowSettingsModal(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteGroup(groupId);
      setResultMessage('삭제되었습니다.');
    } catch (e) {
      alert(e.message || '그룹 삭제에 실패했어요. (백엔드 엔드포인트가 아직 준비되지 않았을 수 있어요)');
    }
  };
  // 방장 권한 위임 (모임장 전용, 백엔드 엔드포인트 추가 필요)
  const handleDelegateClick = () => {
    setShowSettingsModal(false);
    setShowDelegateModal(true);
  };

  const handleDelegateSelect = async (targetMember) => {
    setShowDelegateModal(false);
    try {
      const updated = await delegateGroupOwner(groupId, targetMember.id);
      setGroup(updated);
      setResultMessage('권한이 위임되었습니다.');
    } catch (e) {
      alert(e.message || '권한 위임에 실패했어요. (백엔드 엔드포인트가 아직 준비되지 않았을 수 있어요)');
    }
  };

  const handleResultConfirm = () => {
    setResultMessage(null);
    navigate('/Group');
  };

  // 그룹 소개/규칙 저장 (모임장만 호출됨)
  const handleSaveDesc = async (newDesc) => {
    try {
      const updated = await updateGroup(groupId, {
        name: group.name,
        description: newDesc,
        category: group.category,
        goal: group.goal,
        maxMembers: group.maxMembers,
      });
      setGroup(updated);
    } catch (e) {
      alert(e.message || '소개 수정에 실패했어요.');
    }
  };
 
  // 친구 내보내기 확정 처리
  const handleKickConfirm = async () => {
    try {
      await kickGroupMember(groupId, kickTarget.id);
      setFriends(prev => prev.filter(f => f.id !== kickTarget.id));
    } catch (e) {
      alert(e.message || '내보내기에 실패했어요.');
    } finally {
      setKickTarget(null);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8B95A1' }}>불러오는 중...</div>;
  }
  if (error || !group) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8B95A1' }}>
        {error || '그룹 정보를 찾을 수 없어요.'}
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate('/Group')} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', backgroundColor: '#1E59DA', color: '#fff', cursor: 'pointer' }}>
            내 모임으로 이동
          </button>
        </div>
      </div>
    );
  }


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

      {/* ── 운동 중 인원 텍스트 (백엔드 API 지원되면 표시) ── */}
{activeUserIds && (
  <p style={{ margin: '20px 20px 0', fontSize: 13, fontWeight: '600', color: '#1E59DA' }}>
    지금 {friends.filter(f => activeUserIds.has(f.id)).length}명이 운동 중이에요
  </p>
)}
      

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
        isHost ? (
          <DeleteModal
            groupName={groupName}
            onDeleteClick={handleDeleteClick}
            onDelegateClick={handleDelegateClick}
            onCancel={() => setShowSettingsModal(false)}
          />
        ) : (
          <LeaveConfirmModal
            groupName={groupName}
            onConfirm={handleLeaveConfirm}
            onCancel={() => setShowSettingsModal(false)}
          />
        )
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          groupName={groupName}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showDelegateModal && (
        <DelegateModal
          members={friends.filter(f => f.id !== myUserId)}
          onSelect={handleDelegateSelect}
          onCancel={() => setShowDelegateModal(false)}
        />
      )}

      {selectedFriend && (
        <FriendPopup
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          canKick={isHost && selectedFriend.id !== myUserId}

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
          category={group.category}
          members={`${friends.length}/${group.maxMembers ?? '∞'}`}
          goal={group.goal}
          desc={group.description}
          isHost={isHost}
          onSave={handleSaveDesc}
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