import GhostRunning from '../assets/Components/GhostRunning.png';
import AiImage from '../assets/Components/AiCoach.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function Analyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "사용자";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/AiResult');
    }, 4000);
    return () => clearTimeout(timer);
  });

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '402 / 874',   // 배경 SVG 비율 유지
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    }}>

      {/* 배경 이미지 */}
      <img
        src={AiImage} alt="background"
        style={{
          position: 'absolute',
          top: '-1.1%',   // 원본 top: -10px → -10/874
          left: 0,
          width: '100%',
          zIndex: 0,
        }}
      />

      {/* 캐릭터 이미지 - top: 239/874=27.3%, left: 51/402=12.7% */}
      <div style={{
        position: 'absolute',
        width: '74.6%',    // 300/402
        aspectRatio: '1',
        top: '27.3%',
        left: '12.7%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
      }}>
        <img
          src={GhostRunning} alt="character"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* 텍스트 - top: 601/874=68.8% */}
      <div style={{
        position: 'absolute',
        top: '68.8%',
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 1,
      }}>
        <p style={{
          fontSize: 'clamp(18px, 6vw, 24px)',
          fontWeight: '800', color: '#002738',
          margin: 0, padding: 0,
          width: '100%', textAlign: 'center',
          lineHeight: '1.1',
          wordBreak: 'keep-all', overflowWrap: 'break-word',
        }}>
          {name}님의 체형 사진과 정보를<br />
          분석하고 있어요
        </p>
      </div>

    </div>
  );
}

export default Analyzing;