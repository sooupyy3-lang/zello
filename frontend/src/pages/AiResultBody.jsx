import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { HamburgerButton, HamburgerPanel } from '../pages/HamburgerMenu';

// ── 더미 데이터 정의 ──
const DUMMY_COACHING = {
  aiResponse: `**사용자님의 체형 분석 결과 AI 코칭을 알려드릴게요**

업로드된 체형 사진을 분석한 결과, 상체에 비해 하체 근육 발달이 상대적으로 부족한 편으로 보입니다. 특히 허벅지와 둔근(엉덩이) 근육의 볼륨이 크지 않아 전체적인 체형 균형이 약간 상체 중심으로 나타나는 경향이 있습니다. 또한 골반 주변 근육의 안정성이 다소 약해 보이며 코어 근육의 사용도 충분하지 않은 것으로 판단됩니다.

이러한 체형에서는 하체 근력과 코어 안정성을 함께 강화하는 운동을 진행하면 전체적인 체형 균형을 개선하는 데 도움이 될 수 있습니다.

**AI 운동 코칭**
하체 근육을 강화하기 위해 스쿼트와 런지 같은 복합 하체 운동을 중심으로 루틴을 구성하는 것을 추천합니다. 스쿼트는 허벅지와 둔근을 동시에 자극할 수 있어 하체 근력 향상에 효과적인 운동입니다. 런지는 하체 근육뿐만 아니라 균형감각과 코어 안정성에도 도움을 줄 수 있습니다.`,
  recommendedRoutine: JSON.stringify({
    routines: [
      { name: "스쿼트", sets: 4, reps: "8~12회" },
      { name: "런지", sets: 3, reps: "12~15회" },
      { name: "플랭크", sets: 3, reps: "1분" },
      { name: "데드버그", sets: 3, reps: "15회" }
    ]
  })
};


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
  const name = location.state?.name || '조서영';

  useEffect(() => {
    const timer = setTimeout(() => {
      setCoaching(DUMMY_COACHING);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
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
          onClick={() => navigate('/Page3')}
          style={{
            width: 'calc(343/402*100%)',
            minWidth: '343px',
            height: '51px',
            backgroundColor: '#1E59DA', 
            borderRadius: '14px',
            border: 'none',
            color: '#fff',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(30, 89, 218, 0.25)',
            zIndex: 10
          }}
        >
          마이페이지에 추천 운동 루틴 연동하기
        </button>
      </div>
      

      {menuOpen && (
        <HamburgerPanel userName={name} onClose={() => setMenuOpen(false)} />
      )}
    </div>
  );
}

export default AiResultBody;