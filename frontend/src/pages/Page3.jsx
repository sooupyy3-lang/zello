import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import myImage from '../assets/Components/Page3.png';
import StartEx from '../assets/Components/StartEx.png';
import CalendarIcon from '../assets/Icon/CalendarIcon.png';
import StartExClick from '../assets/Components/StartExClick.png';
import { getHome } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function Page3({ elapsed = 0 }) {
  const navigate = useNavigate();
  const [isHover, setIsHover] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHome()
      .then(setHomeData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const day = dayNames[today.getDay()];
  const formattedDate = ` ${month}. ${date} (${day})`;

  const streakDays = homeData?.streakDays ?? 0;

  let aiRoutine = [];
  try {
    if (homeData?.aiRoutineSummary) {
      const parsed = JSON.parse(homeData.aiRoutineSummary);
      aiRoutine = parsed.routines || [];
    }
  } catch (e) {}

  if (loading) return <LoadingSpinner />;

  return (
  <div style={{ width: '100%', position: 'relative', backgroundColor: '#F3F4F4' }}>
    <div style={{ position: 'relative', height: '390px' }}>
    {/* 배경 이미지 */}
    <img
      src={myImage}
      alt=""
      style={{ position: 'relative', top: 0, left: 0, width: '100%', height: '800px', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
    />

    {/* 오늘 날짜 */}
    <div style={{
      position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)',
      fontSize: '18px', fontWeight: '700', color: '#002738', fontFamily: 'inherit',
      whiteSpace: 'nowrap', zIndex: 1,
    }}>
      {formattedDate}
    </div>

    {/* 타이머 */}
    <div style={{
      position: 'absolute', top: '145.33px', left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1,
    }}>
      <span style={{
        fontSize: '48px', fontWeight: '700', color: '#002738',
        letterSpacing: '2px', fontVariantNumeric: 'tabular-nums',
      }}>
        {formatTime(elapsed)}
      </span>
    </div>

    {/* 운동 시작하기 버튼 */}
    <button
      onClick={() => navigate('/Page4')}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      style={{
        position: 'absolute', left: '120px', top: '232px',
        padding: 0, background: 'none', border: 'none', cursor: 'pointer',
        transition: 'transform 0.1s', zIndex: 1,
      }}
    >
      <img src={isHover ? StartExClick : StartEx} alt="운동 시작하기" style={{ width: '150px', display: 'block' }} />
    </button>
</div>
    {/* 카드 영역 */}
    <div style={{
      position: 'relative', zIndex: 1,
      
      marginLeft: 'auto', marginRight: 'auto',
      width: '316px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      paddingBottom: '20px',
    }}>
      {/* 오늘의 목표 */}
      <div style={{
        backgroundColor: '#BFE8F8', borderRadius: '16px',
        padding: '14px 16px', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <img src={CalendarIcon} alt="캘린더" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#002738' }}>오늘의 목표</span>
        </div>
        <p style={{ fontSize: '13px', color: '#002738', lineHeight: '1.6', margin: 0 }}>
          {streakDays}일째 운동중💪<br />
          목표 시간까지 {homeData?.goalDurationMin ? Math.round(homeData?.goalDurationMin / 60) : '--'} 시간<br />
          목표 칼로리까지 {homeData?.goalCalorie ?? '--'} kcal
        </p>
      </div>

      {/* AI 추천 루틴 */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px',
        padding: '16px', boxSizing: 'border-box',height:'auto'
      }}>
        {aiRoutine.length > 0 ? (
          <>
            <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#002738', textAlign: 'center' }}>AI 추천 루틴</p>
            <div style={{ border: '1.5px solid #002738', borderRadius: '12px', padding: '14px 16px', backgroundColor: '#FFFFFF' }}>
              {aiRoutine.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center', marginBottom: idx < aiRoutine.length - 1 ? '8px' : 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#002738' }}>{item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#002738' }}>{item.sets}세트 × {item.reps}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#8EB3C2', textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
            AI 코칭을 받으면 추천 루틴이 표시돼요
          </p>
        )}
      </div>
    </div>

  </div>
);
}

export default Page3;
