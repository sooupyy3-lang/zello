import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { HamburgerButton, HamburgerPanel } from '../pages/HamburgerMenu';
import { getLatestCoaching, getMyProfile, applyCoachingRoutine } from '../api';
import { getUserName } from '../api';


function renderResponse(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: '12px' }} />;
    
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/);
    const rendered = parts.map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j} style={{ fontWeight: '800', color: '#1E59DA' }}>{part.slice(2, -2)}</strong>
        : part
    );

    const isSubHeader = trimmed.includes('AI 운동 코칭') || (parts.length === 3 && parts[0] === '' && parts[2] === '');

    return (
      <p key={i} style={{ 
        margin: isSubHeader ? '28px 0 8px' : '4px 0', 
        fontSize: '13px', 
        fontWeight: isSubHeader ? '500' : '400', 
        color: isSubHeader ? '#1E59DA' : '#4E5968', 
        lineHeight: '1.7',
        textAlign: 'justify',
        wordBreak: 'keep-all'
      }}>
        {rendered}
      </p>
    );
  });
}

function AiResultBody() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [coaching, setCoaching] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState(location.state?.name || '사용자');
  const [applying, setApplying] = useState(false);
const username = location.state?.name || getUserName() || "사용자";
  useEffect(() => {
    let cancelled = false;

    // 이름은 location.state로 이미 넘어왔으면 그대로 쓰고, 없으면 내 프로필에서 가져와요.
    if (!location.state?.name) {
      getMyProfile()
        .then(profile => { if (!cancelled && profile?.name) setName(profile.name); })
        .catch(() => {});
    }

    getLatestCoaching()
      .then(data => {
        if (cancelled) return;
        if (!data) {
          setError('아직 AI 코칭 결과가 없어요.');
        } else {
          setCoaching(data);
        }
      })
      .catch(e => { if (!cancelled) setError(e.message || 'AI 코칭 결과를 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  let routine = [];
  if (coaching?.recommendedRoutine) {
    try {
      const parsed = JSON.parse(coaching.recommendedRoutine);
      routine = parsed.routines || [];
    } catch (e) {}
  }

  const handleApplyRoutine = async () => {
    if (!coaching?.logId) return;
    setApplying(true);
    try {
      await applyCoachingRoutine(coaching.logId);
      navigate('/Page3');
    } catch (e) {
      alert(e.message || '루틴 연동에 실패했어요. (백엔드 엔드포인트가 아직 준비되지 않았을 수 있어요)');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '450px',
      margin: '0 auto',
      height: '100%',
      backgroundColor: '#fff',
      padding: '20px 20px 140px', 
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* ── 1. 헤더 영역 (카드 스타일 제거) ── */}
      <div style={{
        width:'100%',
        marginLeft: 'calc(0%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        padding: '50px 15px 16px',
        backgroundColor:'#fff',
        borderBottom: '1px solid #EEEEEE'
      }}>
        <div style={{ display: 'flex', alignItems: 'center',marginTop: '10px' }}>
    <HamburgerButton onOpen={() => setMenuOpen(true)} />
  </div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#333D4B', margin: 0 }}>
          체형 데이터 기반 AI 운동 코칭
        </h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8B95A1', fontSize: 14 }}>
          {error}
        </div>
      ) : (
        <div style={{ padding: '0 4px' }}>
          {/* ── 2. 본문 리포트  ── */}
          <div style={{ marginBottom: '40px' }}>
            {renderResponse(coaching.aiResponse)}
          </div>

          {/* ── 3. 추천 운동 루틴  ── */}
          {routine.length > 0 && (
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '32px', 
              border: '1px solid #B1D5FF',
              padding: '30px 20px', 
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E59DA', margin: '0 0 6px' }}>
                &lt;추천 운동 루틴&gt;
              </p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#1E59DA', margin: '0 0 24px' }}>
                하체 및 코어 중심 루틴
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {routine.map((item, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#EBF0FF',
                    borderRadius: '20px',
                    padding: '15px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '60px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#1E59DA', marginBottom: '2px' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#1E59DA', opacity: 0.7 }}>
                      {item.sets}세트 × {item.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. 하단 버튼 ── */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '40px 0 60px' 
      }}>
        <button
          onClick={handleApplyRoutine}
          disabled={applying || !coaching}
          style={{
            width: 'calc(343/402*100%)',
            minWidth: '343px',
            height: '51px',
            backgroundColor: applying ? '#9DB8E8' : '#1E59DA', 
            borderRadius: '14px',
            border: 'none',
            color: '#fff',
            fontSize: '17px',
            fontWeight: '600',
            cursor: applying ? 'default' : 'pointer',
            boxShadow: '0 6px 16px rgba(30, 89, 218, 0.25)',
            zIndex: 10
          }}
        >
          {applying ? '연동 중...' : '마이페이지에 추천 운동 루틴 연동하기'}
        </button>
      </div>
      

      {menuOpen && (
  <HamburgerPanel userName={username} onClose={() => setMenuOpen(false)} />
)}
    </div>
  );
}

export default AiResultBody;