import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MascotImage from '../assets/Components/GhostGreeting.svg';
import RecordImage from '../assets/Components/DayRecord.png';
import BackForward from '../assets/Icon/BackForward.svg';
import { getSessionByDate } from '../api';

function DayRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { day, month, year } = location.state || {};
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!day || month == null || !year) { setLoading(false); return; }
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    getSessionByDate(dateStr)
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [day, month, year]);

  const totalSec = session?.totalDurationSec || 0;
  const totalHour = Math.floor(totalSec / 3600);
  const totalMin = Math.floor((totalSec % 3600) / 60);
  const totalCal = Math.round(session?.totalCalories || 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>
      <img src={RecordImage} alt="background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', overflowY: 'auto' }}>
        {/* 헤더 */}
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', paddingTop: '139px', position: 'relative' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: '20px' }}>
            <img src={BackForward} alt="이전" style={{ width: '10px', height: '20px', objectFit: 'contain' }} />
          </button>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#002738' }}>
            {month != null ? month + 1 : '?'}월 {day}일 운동 기록
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
          <img src={MascotImage} alt="mascot" style={{ width: '251px', marginTop: '50px', marginBottom: '29px' }} />

          {loading ? (
            <p style={{ fontSize: '18px', color: '#8EB3C2' }}>불러오는 중...</p>
          ) : !session ? (
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#002738', textAlign: 'center' }}>
              이 날은 운동 기록이 없어요 😴
            </p>
          ) : (
            <>
              <div style={{ width: '100%', textAlign: 'center', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#002738' }}>
                  총 운동 시간 - {totalHour > 0 ? `${totalHour}시간 ` : ''}{totalMin}분
                </p>
                {session.tracks?.map((t, i) => (
                  <p key={i} style={{ margin: '2px 0', fontSize: '19px', fontWeight: '700', color: '#002738' }}>
                    {t.exerciseName} {Math.floor(t.elapsedSec / 60)}분
                  </p>
                ))}
              </div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#002738' }}>칼로리 소모</p>
                {session.tracks?.map((t, i) => (
                  <p key={i} style={{ margin: '2px 0', fontSize: '19px', fontWeight: '700', color: '#002738' }}>
                    {t.exerciseName} {Math.round(t.calories || 0)} kcal
                  </p>
                ))}
                <p style={{ margin: '12px 0 0', fontSize: '20px', fontWeight: '700', color: '#002738' }}>
                  총 {totalCal} kcal 소모
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DayRecord;
