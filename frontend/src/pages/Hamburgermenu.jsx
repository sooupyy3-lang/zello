import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import dumbbellimg from '../assets/Icon/Dumbbell.svg';
import Hambuttonimg from '../assets/Icon/Hambutton.svg'


function UserIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#E9EAEF"/>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M24 12C20.686 12 18 14.686 18 18C18 21.314 20.686 24 24 24C27.314 24 30 21.314 30 18C30 14.686 27.314 12 24 12ZM16 32C16 28.686 19.582 26 24 26C28.418 26 32 28.686 32 32V34H16V32Z"
        fill="#B0B8C1"/>
    </svg>
  );
}

const NAV_ITEMS = [
  {  label: '친구들 보기',    path: '/Friends' },
  {  label: '나의 운동 모임', path: '/Group' },
  {  label: 'AI 운동 코칭',   path: '/AiCoach' },
  {  label: '마이페이지',     path: '/MyPage' },
];

export function HamburgerButton({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
    >
      <img src={Hambuttonimg} style={{ width: 26, height:17}}/>
    </button>
  );
}

export function HamburgerPanel({ userName = '사용자', onClose }) {
  const navigate = useNavigate();

  const container = document.getElementById('app-container');
  if (!container) return null;

  return createPortal(
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 200,
        }}
      />

      {/* 슬라이드 패널 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '72%', maxWidth: 289,
        height: '100%',
        backgroundColor: '#ffffff',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', boxSizing: 'border-box',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
        animation: 'slideIn 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{ alignSelf: 'flex-start', marginLeft: 20, marginBottom: 28, background: 'none', border: '1px solid #E0E0E0', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <rect y="3"  width="22" height="2" rx="1" fill="#555"/>
            <rect y="10" width="22" height="2" rx="1" fill="#555"/>
            <rect y="17" width="22" height="2" rx="1" fill="#555"/>
          </svg>
        </button>

        {/* 유저 프로필 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', marginBottom: 36 }}>
          <UserIcon />
          <span style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>{userName} 님</span>
        </div>

        {/* 구분선 */}
        <div style={{ height: '0.5px', backgroundColor: '#F0F0F0', marginBottom: 16 }} />

        {/* 메뉴 항목 */}
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); onClose(); }}
              style={{ width: '100%', padding: '14px 24px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16, color: '#222',display: 'flex', alignItems: 'center', gap: 12, }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F7FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >     <img src={dumbbellimg} alt="" style={{ width: 24, height: 24,flexShrink: 0 }} /> 

              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>,
    container  
  );
}