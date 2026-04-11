import { useNavigate,useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import myImage from '../assets/Components/Page3.png';
import StartEx from '../assets/Components/StartEx.png';
import CalendarIcon from '../assets/Icon/CalendarIcon.png';
import StartExClick from '../assets/Components/StartExClick.png';
import { getHome, getUserName } from '../api';

function Page3({ elapsed = 0 }) {
  const navigate = useNavigate();
   const location = useLocation();
  const [isHover, setIsHover] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [goal, setGoal] = useState('');

  useEffect(() => {
    getHome()
      .then(setHomeData)
      .catch(() => {}); // 미로그인 시 무시
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

  const name = getUserName() || '사용자';
  const streakDays = homeData?.streakDays ?? 0;
  const aiRoutineSummary = homeData?.aiRoutineSummary;

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: `url(${myImage})`,
      backgroundSize: '100% 100%',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 오늘 날짜 */}
      <div style={{
        position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)',
        fontSize: '18px', fontWeight: '700', color: '#002738', fontFamily: 'inherit',
        whiteSpace: 'nowrap', zIndex: 10,
      }}>
        {formattedDate}
      </div>

      {/* 타이머 */}
      <div style={{
        position: 'absolute', top: '145.33px', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20,
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
          position: 'absolute', left: '131.5px', top: '232px',
          padding: 0, background: 'none', border: 'none', cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
      >
        <img src={isHover ? StartExClick : StartEx} alt="운동 시작하기" style={{ width: '150px', display: 'block' }} />
      </button>

      {/* AI 추천 루틴 박스 */}
      <div style={{
        position: 'absolute', top: '401px', left: '50%', transform: 'translateX(-50%)',
        width: '316px', minHeight: '218px',
        backgroundColor: '#FFFFFF', borderRadius: '16px',
        padding: '16px', boxSizing: 'border-box', zIndex: 20,
      }}>
        {aiRoutineSummary ? (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: '#002738' }}>AI 추천 루틴</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#002738', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {aiRoutineSummary.length > 200 ? aiRoutineSummary.slice(0, 200) + '...' : aiRoutineSummary}
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#8EB3C2', textAlign: 'center', paddingTop: '80px' }}>
            AI 코칭을 받으면 추천 루틴이 표시돼요
          </p>
        )}
        {streakDays > 0 && (
          <p style={{ margin: '12px 0 0', fontSize: '13px', fontWeight: '700', color: '#002738', textAlign: 'right' }}>
            🔥 {streakDays}일째 연속 운동 중!
          </p>
        )}
      </div>

      {/* 오늘의 목표 박스 */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        width: '316px', minHeight: '103px',
        backgroundColor: '#BFE8F8', borderRadius: '16px',
        padding: '14px 16px', boxSizing: 'border-box', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <img src={CalendarIcon} alt="캘린더" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#002738' }}>오늘의 목표</span>
        </div>
       
          
        {/* 텍스트 */}
        <p style={{ fontSize: '13px', color: '#002738', lineHeight: '1.6', margin: 0 }}>
          
          {streakDays}일째 운동중💪<br />
            목표 시간까지 {homeData?.goalDurationMin ? Math.round(homeData?.goalDurationMin/60) : '--'} 시간<br />
            목표 칼로리까지 {homeData?.goalCalorie ?? '--'} kcal
           </p>
      </div>
    </div>
  );
}

export default Page3;
