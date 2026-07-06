import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getHome } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import Backimg from '../assets/Icon/BackForward.svg';

const COLORS = {
  primary: "#1E59DA",
  primaryLight: "#ffffff",
  primaryText: "#1E59DA",
};
const TABS = ["시간순", "목표 달성순", "운동 지속일순"];
const RANKING_DATA = [
  { rank: 1, name: "훈남민성 님", days: 12 },
  { rank: 2, name: "헬스걸 님", days: 8 },
  { rank: 3, name: "집가고싶다 님", days: 4 },
];

function Page3({ elapsed = 0 }) {
  const navigate = useNavigate();
  const [isHover, setIsHover] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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
  const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')} (${dayNames[today.getDay()]})`;

  // AI 루틴 데이터 파싱
  let aiRoutine = [];
  try {
    if (homeData?.aiRoutineSummary) {
      const parsed = JSON.parse(homeData.aiRoutineSummary);
      aiRoutine = parsed.routines || [];
    }
  } catch (e) {}

  if (loading) return <LoadingSpinner />;

  return (
        <div style={styles.pageWrapper}>
          <button
      onClick={() => navigate(-1)}
      style={{
        position: 'absolute',
        top:`calc(36/874*100vh)` , left:`calc(16/402*100%)` ,
        background: 'none', border: 'none',
        cursor: 'pointer', padding: 0,
        zIndex: 10,
      }}
    >
      <img
        src={Backimg}
        alt="뒤로"
        style={{
          width: 'clamp(4px, 7vw, 16px)',
          height: 'clamp(14px, 7vw, 16px)',
          objectFit: 'contain',
        }}
      />
    </button>
          
          
          
        {/*영역1*/}
        <div style={styles.timerSection}>    
          

              

        {/* 오늘 날짜 */}
                <p style={styles.timerDate}>{formattedDate}</p>


        {/* 타이머 */}
         <p style={styles.timerDisplay}>{formatTime(elapsed)}</p>

        {/* 운동 시작하기 버튼 */}
        <button
    onClick={() => navigate('/Page4')}
    onMouseEnter={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
     onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  style={{
    ...styles.timerBtn,
    backgroundColor: isHover ? '#F0F4FF' : '#FFFFFF',
    boxShadow: isHover ? '0 6px 15px rgba(0,0,0,0.2)' : styles.timerBtn.boxShadow,
  }}
>
  <span style={styles.timerBtnText}>운동 시작하기</span>
</button>
      </div>

      {/* 카드 영역 */}
     <div style={styles.cardsWrapper}>


        {/* 영역 2: 오늘의 운동 랭킹  */}
        <div style={styles.card}>
          <p style={styles.sectionTitle}>오늘의 운동 랭킹</p>
          <div style={styles.tabs}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                style={{
                  ...styles.tab,
                  ...(activeTab === i ? styles.tabActive : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {RANKING_DATA.map((item, i) => (
            <div key={i} style={{...styles.rankItem, borderBottom: i < RANKING_DATA.length - 1 ? "0.5px solid #e5e7eb" : "none"}}>
              <span style={styles.rankNum}>{item.rank}</span>
              <div style={styles.avatar}>👤</div>
              <span style={styles.rankName}>{item.name}</span>
              <span style={styles.rankDays}>{item.days}일째 운동 중</span>
            </div>
          ))}
          <button style={styles.moreBtn}> +더보기</button>
        </div>
 {/* 영역 3: AI 추천 루틴 */}
        <div style={styles.card}>
          <div style={styles.aiHeader}>
            <p style={styles.sectionTitle}>AI 운동 코칭</p>
            <button style={styles.moreLink}>+ 이력보기</button>
          </div>
          {aiRoutine.length > 0 ? (
            <div style={styles.workoutScroll}>
              {aiRoutine.map((item, idx) => (
                <div key={idx} style={styles.workoutChip}>
                  <span style={styles.chipName}>{item.name}</span>
                  <span style={styles.chipDetail}>{item.sets}세트 × {item.reps}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.aiEmptyText}>AI 코칭을 받으면 루틴이 표시돼요</p>
          )}
        </div>
      </div>
      </div>
      );
      }
export default Page3;

 const styles = {
  /* 페이지 전체 */
  pageWrapper: {
    width: '100%',
    height:'100vh',
    backgroundColor: '#E9EAEF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '98px',
    overflowY:'hidden',
  },
 
  /* ── 영역 1: 타이머 (고정 높이) ── */
  timerSection: {
    position: 'relative',
    width: 'calc(376 / 402 * 100%)', 
    maxWidth:'376px',
    height: '28.7vh', 
    minHeight: '280px', 
    maxHeight: '340px',          
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    alignItems: 'center',
    padding: '40px 20px',
    justifyContent: 'space-between',
    gap: '8px',
    overflow: 'hidden',
    backgroundColor:'#1E59DA',
    boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: '39px',
    boxSizing: 'border-box',
    marginBottom: '19px',

    

  },
  
  timerDate: {
    position: 'relative', zIndex: 1,
    fontSize: 'clamp(15px, 4.5vw, 18px)',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',

  },
  timerDisplay: {
    position: 'relative', 
    zIndex: 1,
    fontSize: 'clamp(36px, 11vw, 48px)',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '2px',
    margin: 0,
    marginBottom: 32,
    fontfamily:'inherit',
    lineHeight:'66.667%',
    textAlign: 'center',

  },

  timerBtn: {
    display: 'flex',
    width: `calc(211/402*100vw)`,
    maxWidth: '220px',
    height: '40px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '20px',
    background: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    padding: '0 15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  timerBtnText: {
    color: '#1441A2', // 파란색 테마
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '1px', // 자간을 살짝 좁혀서 세련되게
    textAlign: 'center',
    lineHeight:'213.333%'
  },

  
 cardsWrapper: {
   width: 'calc(376 / 402 * 100%)', 
   maxWidth: '376px',               
   flexDirection: 'column',
   gap: 12,
   paddingTop: '19px',
   paddingBottom: 20,
   alignItems: 'center', 
 },
  /* 영역 2, 3 공통) */
  card: {
    width: '100%',
    maxWidth:'376px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '20px',
    boxSizing: 'border-box',
    marginBottom:'17px',
    display: 'flex',
    flexDirection: 'column',

  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '10px' },
 
  /* ── 영역 2: 오늘의 운동랭킹 (높이 가변) ── */
  tabs: { width:'100%', display: "flex", gap: 8, marginBottom: 16 },
  tab: { padding: "8px", borderRadius: 20, fontSize: 12, whiteSpace: "nowrap",border: "0.5px solid #E9EAEF", background: "none", cursor: 'pointer' },
  tabActive: { background: '#1E1E1E', color: "#ffffff",  },
  rankItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0" },
  rankNum: { width: 18, fontSize: 14, fontWeight: 700, color: COLORS.primary },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#DBE9F9", textAlign: 'center', lineHeight: '32px' },
  rankName: { color:'#000',flex: 1, fontSize: 12, fontWeight:'500', lineHeight:'normal' },
  rankDays: { fontSize: 12, color: "#8E8E8E" },
  moreBtn: { width:'61px', height:'19px',alignSelf: 'flex-end', padding: 0, fontSize:'10px',fontWeight:500,marginTop: 16, background: "#E9EAEF", border: "0.5px solid #e5e7eb", borderRadius: '8px', cursor: 'pointer',display: 'flex',
  alignItems: 'center',     
  justifyContent: 'center',lineHeight: 'normal'},

  
  /* ── 영역 3: AI 추천 루틴 (높이 가변) ── */

  aiHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  moreLink: { fontSize: 12, color: COLORS.primary, background: "none", border: "none", cursor: 'pointer' },
  workoutScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 },
  workoutChip: { flexShrink: 0, background: COLORS.primaryLight, borderRadius: 20, padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 },
  chipName: { fontSize: 12, fontWeight: 700, color: COLORS.primary },
  chipDetail: { fontSize: 11, color: COLORS.primary },
  aiEmptyText: { color: "#9ca3af", textAlign: 'center', padding: '20px 0', fontSize: '13px' },
 
 
  aiCard: {
    width: '100%',               
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    boxSizing: 'border-box',
  },
  aiCardTitle: {
    margin: '0 0 12px',
    fontSize: 'clamp(12px, 3.5vw, 14px)',
    fontWeight: '700',
    color: '#002738',
    textAlign: 'center',
  },
  aiRoutineBox: {
    border: '1.5px solid #002738',
    borderRadius: 12,
    padding: '14px 16px',
    backgroundColor: '#FFFFFF',
  },
  aiRoutineItem: {
    textAlign: 'center',
  },
  aiRoutineName: {
    margin: 0,
    fontSize: 'clamp(11px, 3.2vw, 13px)',
    fontWeight: '700',
    color: '#002738',
  },
  aiRoutineDetail: {
    margin: '2px 0 0',
    fontSize: 'clamp(10px, 3vw, 12px)',
    color: '#002738',
  },
  aiEmptyText: {
    margin: 0,
    fontSize: 'clamp(11px, 3.2vw, 13px)',
    color: '#8EB3C2',
    textAlign: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
};