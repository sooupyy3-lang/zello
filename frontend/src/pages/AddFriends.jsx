import React, { useState, useEffect } from 'react';
import { HamburgerButton } from '../pages/HamburgerMenu.jsx'; 
import { HamburgerPanel } from '../pages/HamburgerMenu.jsx';
import { getMyGroups, sendFriendRequestByNickname, joinGroupByCode } from '../api';


function AddFriends() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [name, setName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupIndex, setGroupIndex] = useState(0); 
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const currentGroup = myGroups[groupIndex] ?? null; 

  useEffect(() => {
    getMyGroups()
      .then(list => setMyGroups(list ?? []))
      .catch(() => setMyGroups([]))
      .finally(() => setGroupsLoading(false));
  }, []);

  const openModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handlePrevGroup = () => setGroupIndex(i => (i - 1 + myGroups.length) % myGroups.length);
  const handleNextGroup = () => setGroupIndex(i => (i + 1) % myGroups.length);

  const handleCopy = () => {
    if (!currentGroup) return;
    navigator.clipboard.writeText(currentGroup.inviteCode); // 백엔드 필드명은 code가 아니라 inviteCode
    openModal('코드가 복사되었습니다.');
  };

  const handleSearch = async () => {
    if (!name.trim()) return;
    try {
      await sendFriendRequestByNickname(name.trim());
      openModal(`${name}님에게 친구 요청을 보냈어요.`);
      setName('');
    } catch (e) {
      openModal(e.message || '친구 요청에 실패했어요.');
    }
  };

  const handleConfirm = async () => {
    if (!groupCode.trim()) return;
    try {
      const joined = await joinGroupByCode(groupCode.trim());
      openModal(`${joined?.name ?? '그룹'} 참여가 완료되었습니다.`);
      setGroupCode('');
    } catch (e) {
      openModal(e.message || '그룹 참여에 실패했어요.');
    }
  };

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setShowModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div style={{ backgroundColor: '#fff', height: '100%',
  maxHeight: '874px', 
  padding: '0 20px', 
  position: 'relative', 
  overflow: 'hidden',
  margin: '0 auto',   
  width: '100%',
  maxWidth: '500px'}}>
    {/* 햄버거 패널 */}
    {menuOpen && <HamburgerPanel userName="사용자" onClose={() => setMenuOpen(false)} />}
      {/* ── 헤더 ── */}
      <header style={{ 
        height: `calc(115/874*100dvh)`, 
        maxHeight: '874px',
        display: 'flex', 
        justifyContent: 'center', 
        position: 'relative',
        paddingTop: '28%',
        borderBottom: '1px solid #F0F0F0',
        overflow: 'hidden',
        marginBottom:'50px',
        zIndex: 10
      }}>
        <div style={{ position: 'absolute', left: '0.5%', top:'70%',zIndex: 20 }}>
         <HamburgerButton onOpen={() => setMenuOpen(true)} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>친구 추가하기</h2>
      </header>

      {/* ── 이름 검색 섹션 ── */}
      <section style={{ marginBottom: '54px' }}>
        <h3 style={labelStyle}>이름</h3>
        <div style={inputContainerStyle}>
          <input 
            type="text" 
            placeholder="이름을 입력하세요." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
<button onClick={handleSearch} style={actionButtonStyle}>검색</button>          
        </div>
      </section>

      {/* ── 그룹 초대 코드 섹션 ── */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ ...labelStyle, marginBottom: 0 }}>그룹 초대 코드</h3>
          {myGroups.length > 0 && (
            <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentGroup?.name}
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <button onClick={handlePrevGroup} style={arrowButtonStyle}>▲</button>
                <button onClick={handleNextGroup} style={arrowButtonStyle}>▼</button>
              </span>
            </div>
          )}
        </div>
        <div style={codeBoxStyle}>
          {groupsLoading ? (
            <span style={{ fontSize: '13px', color: '#AAA' }}>불러오는 중...</span>
          ) : myGroups.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#AAA' }}>가입된 그룹이 없어요.</span>
          ) : (
            <>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#111', letterSpacing: '1px' }}>
                {currentGroup.inviteCode}
              </span>
              <button onClick={handleCopy} style={copyButtonStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── 그룹 코드 입력 섹션 ── */}
      <section>
        <h3 style={labelStyle}>그룹 코드 입력</h3>
        <p style={{ fontSize: '13px', color: '#AAA', marginBottom: '15px' }}>
          그룹 코드는 입력 후 변경할 수 없어요.
        </p>
        <div style={inputContainerStyle}>
          <input 
            type="text" 
            placeholder="코드를 입력하세요." 
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            style={inputStyle}
          />
<button onClick={handleConfirm} style={{ ...actionButtonStyle, backgroundColor: '#E8EFFF', color: '#1E59DA' }}>확인</button>        </div>
      </section>

      {/* ── 팝업 모달 ── */}
      {showModal && (
        <>
          {/* 딤 처리 */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1000
          }} onClick={() => setShowModal(false)} />

          {/* 팝업창 */}
          <div style={{
            position: 'absolute',
            top: `calc(670/874*100%)`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '92%',
            
            aspectRatio: '386 / 71',
            backgroundColor: '#E1EEFF', 
            borderRadius: '24px',      
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            zIndex: 1001,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <p style={{ 
              fontSize: '15px', 
              color: '#333', 
              fontWeight: '500',
              textAlign: 'center' 
            }}>
              {modalMessage}
            </p>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    
    </div>
  );
}

// ── 스타일 객체 ──
const labelStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#000',
  marginBottom: '12px'
};

const inputContainerStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
};

const inputStyle = {
  flex: 1,
  height: '48px',
  borderRadius: '8px',
  border:'1px solid #B0B8C1',
  padding: '0 16px',
  fontSize: '14px',
  outline: 'none'
};

const actionButtonStyle = {
  width: '64px',
  height: '48px',
  backgroundColor: '#E8F0FE',
  borderRadius: '8px',
  color: '#4285F4',
  fontWeight: '600',
  cursor: 'pointer'
};

const codeBoxStyle = {
  height: '130px',
  border:'1px solid #B0B8C1',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  backgroundColor: '#fff'
};

const copyButtonStyle = {
  position: 'absolute',
  right: '24px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px'
};

const arrowButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 5,
  fontSize: '15px',
  lineHeight: '8px',
  color: '#888'
};

export default AddFriends;