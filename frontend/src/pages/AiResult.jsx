import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLatestCoaching, getUserName } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function renderResponse(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json[\s\S]*?```/g, '').trim();
  return cleaned.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: '8px' }} />;
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/);
    const rendered = parts.map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j} style={{ fontWeight: '800' }}>{part.slice(2, -2)}</strong>
        : part
    );
    const isHeader = parts.length === 3 && parts[0] === '' && parts[2] === '';
    return isHeader
      ? <p key={i} style={{ margin: '16px 0 4px', fontSize: 'clamp(14px, 4vw, 15px)', fontWeight: '800', color: '#002738' }}>{rendered}</p>
      : <p key={i} style={{ margin: '2px 0', fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#002738', lineHeight: '1.8' }}>{rendered}</p>;
  });
}

function AiResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || getUserName() || '사용자';
  const [coaching, setCoaching] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestCoaching()
      .then(setCoaching)
      .catch(() => setCoaching(null))
      .finally(() => setLoading(false));
  }, []);

  let routine = [];
  if (coaching?.recommendedRoutine) {
    try {
      const parsed = JSON.parse(coaching.recommendedRoutine);
      routine = parsed.routines || [];
    } catch (e) {}
  }

  return (
    <div style={{
      /* 반응형 컨테이너 설정 */
      width: '100%',
      maxWidth: '450px', // 최대 너비 제한
      margin: '0 auto',  // 중앙 정렬
      minHeight: '100vh',
      backgroundColor: '#F3F4F4',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: 'clamp(20px, 5vw, 40px) 24px 60px', // 상단 여백 유동적
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(20px, 6vw, 32px) clamp(16px, 5vw, 24px)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '27px',
      }}>
        <h1 style={{ 
          fontSize: 'clamp(20px, 6vw, 24px)', // 글자 크기 반응형
          fontWeight: '800', 
          color: '#002738', 
          textAlign: 'center', 
          margin: '0 0 32px', 
          lineHeight: '1.3' 
        }}>
          체형 기반 AI 코칭 받기
        </h1>

        {loading ? (
          <LoadingSpinner />
        ) : !coaching ? (
          <p style={{ fontSize: '16px', color: '#8EB3C2', textAlign: 'center' }}>
            코칭 결과를 찾을 수 없어요.<br />사진을 업로드해주세요.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: '700', color: '#002738', margin: '0 0 12px' }}>
              {name}님의 체형 분석 결과 AI 코칭을 알려드릴게요
            </p>
            <div style={{ wordBreak: 'keep-all', marginBottom: '24px' }}>
              {renderResponse(coaching.aiResponse)}
            </div>

            {routine.length > 0 && (
              <div style={{ 
                border: '1.5px solid #000000', 
                borderRadius: '15px', 
                padding: '20px 24px', 
                marginBottom: '24px', 
                backgroundColor: '#FFFFFF' 
              }}>
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#002738', margin: '0 0 16px', textAlign: 'center' }}>
                  추천 운동 루틴
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {routine.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#002738', textAlign: 'center' }}>{item.name}</p>
                      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '500', color: '#002738', textAlign: 'center' }}>
                        {item.sets}세트 × {item.reps}
                      </p>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => navigate('/Page3')}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          /* 버튼 반응형 설정 */
          width: '100%',
          maxWidth: '400px', // 버튼이 너무 커지는 것 방지
          height: 'clamp(56px, 15vw, 66px)', // 높이도 화면에 따라 조절
          margin: '0 auto',
          backgroundColor: '#BFE8F8',
          borderRadius: '9px',
          border: 'none',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          color: '#002738',
          fontSize: 'clamp(18px, 5vw, 20px)',
          fontWeight: '800',
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.1s ease-in-out',
        }}>
        추천 운동 루틴 연동하기
      </button>
    </div>
  );
}

export default AiResult;