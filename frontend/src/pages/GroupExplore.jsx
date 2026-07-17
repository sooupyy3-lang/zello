import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { joinGroupByCode } from '../api';




// ── 아바타 아이콘 ─────────────────────────────────────
function Avatar({ size = 52 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: '#E8EDF5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#B0BEC5" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#B0BEC5" />
      </svg>
    </div>
  );
}

// ── 가입 완료 중앙 모달 ───────────────────────────────
function JoinModal({ groupName, onConfirm }) {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 200, animation: 'fadeIn 0.2s ease',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: '32px 24px 24px',
        zIndex: 201,
        width: '75%',
        textAlign: 'center',
        animation: 'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700', color: '#191F28' }}>
          운동 그룹 가입
        </p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>
          {groupName}에 가입되었습니다
        </p>
        <button
          onClick={onConfirm}
          style={{
            width: '100%', padding: '13px 0',
            backgroundColor: '#1E59DA', color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: '700', cursor: 'pointer',
          }}
        >
          확인
        </button>
      </div>
      <style>{`
        @keyframes popIn { from { transform: translate(-50%, -50%) scale(0.85); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function GroupExplore() {
  const navigate = useNavigate();
  const location = useLocation();
  const group = location.state?.group;
  const members = group?.members ?? [];


  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);

  if (!group) {
    // 그룹 데이터 없이 직접 URL로 진입한 경우
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8B95A1' }}>
        그룹 정보를 찾을 수 없어요.
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate('/AddGroup')} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', backgroundColor: '#1E59DA', color: '#fff', cursor: 'pointer' }}>
            모임 찾기로 이동
          </button>
        </div>
      </div>
    );
  }

  const handleJoinConfirm = () => {
    setShowJoinModal(false);
    navigate(-2); // Group 페이지로 복귀
  };

  const handleJoinClick = async () => {
    if (joining) return;
    setJoining(true);
    try {
      await joinGroupByCode(group.inviteCode);
      setShowJoinModal(true);
    } catch (e) {
      alert(e.message || '가입에 실패했어요.');
    } finally {
      setJoining(false);
    }
  };


  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* ── 헤더 ── */}
      <div style={{
        padding: '0 20px', backgroundColor: '#FFFFFF',
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #F0F0F0', height: '60px',
        boxSizing: 'border-box', flexShrink: 0, position: 'relative',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', pointerEvents: 'none',
        }}>{group.name}</h1>
      </div>

      {/* ── 스크롤 콘텐츠 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>

        {/* 그룹 소개 영역 */}
        {!isDescOpen ? (
          <div onClick={() => setIsDescOpen(true)} style={{ margin: '10px 20px', cursor: 'pointer' }}>
            <div style={{ 
              backgroundColor: '#EBF0FF', borderRadius: 12, padding: '14px 16px', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <span style={{ fontSize: 14, fontWeight: '600', color: '#1E59DA' }}>그룹 소개/규칙</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#1E59DA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '0 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 10, fontSize: 16, fontWeight: '700', color: '#191F28' }}>그룹소개/규칙</p>
              <span onClick={() => setIsDescOpen(false)} style={{ fontSize: 12, color: '#8B95A1', cursor: 'pointer', padding: '4px' }}>접기</span>
            </div>
            <div style={{ padding: '0 20px' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', lineHeight: 1.6, wordBreak: 'break-all' }}>
                {group.desc || '소개 내용이 없습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* 멤버 그리드 */}
        <div style={{
          margin: '16px 20px 0',
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '20px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px 4px',
        }}>
           {members.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 13, color: '#8B95A1' }}>멤버 정보가 없어요.</p>
          )}
          {members.map(member => (
            <div key={member.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Avatar size={52} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: '600', color: '#333D4B' }}>{member.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#8B95A1' }}>{member.time}</p>
                <p style={{ margin: '1px 0 0', fontSize: 10, fontWeight: '600', color: '#191F28' }}>{member.kcal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 가입하기 버튼 (하단 고정) ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '5%',
        padding: '12px 20px 28px',
        borderTop: '1px solid #F0F0F0',
      }}>
        <button
          onClick={handleJoinClick}
          disabled={joining}
          style={{
            width: '100%', padding: '15px 0',
            backgroundColor: '#1E59DA', color: '#fff',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: '700', cursor: joining ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {joining ? '가입 중...' : '가입하기'}
        </button>
      </div>

      {/* ── 가입 완료 모달 ── */}
      {showJoinModal && (
        <JoinModal groupName={group.name} onConfirm={handleJoinConfirm} />
      )}
    </div>
  );
}