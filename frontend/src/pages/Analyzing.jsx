import GhostGreetingimg from '../assets/Components/GhostGreeting.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "사용자";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/AiResultBody');
    }, 3000); 
    return () => clearTimeout(timer);
  }, [navigate]);



  return (
    <div style={{ 
      width: '90%', 
      maxWidth: '450px',
      margin: '0 auto',
      height: '100%', 
      backgroundColor: '#fff', 
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* ── 1. 상단 헤더 ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '78px 20px 20px',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.09)',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#333D4B', margin: 0 }}>
          AI 체형 분석 중
        </h1>
      </div>

      {/* ── 2. 중앙 분석 영역 ── */}
      <div style={{
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        gap: '40px' 
      }}>
        
        {/* 캐릭터 이미지 */}
        <img
          src={GhostGreetingimg}
          alt="character"
          style={{ 
            width: '100%', 
            maxWidth: '370px', 
            height: '', 
            objectFit: 'contain' 
          }}
        />

        {/* 안내 텍스트 */}
        <p style={{
          fontSize: '22px', 
          fontWeight: '800', 
          color: '#002738',
          margin: 0, 
          textAlign: 'center',
          lineHeight: 1.5,
          wordBreak: 'keep-all',
        }}>
          {name}님의 체형 사진과 정보를<br />
          분석하고 있어요
        </p>
      </div>

      {/* 하단 여백용 (디자인 밸런스) */}
      <div style={{ height: '100px' }} />
    </div>
  );
}

export default Analyzing;