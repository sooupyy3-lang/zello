import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GhostRunning from '../assets/Components/GhostRunning.png';
import BackForward from '../assets/Icon/BackForward.svg';
import { getHome } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function Calendar() {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHome().then(setHomeData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const workedOutDates = homeData?.workedOutDates || [];
  const streakDays = homeData?.streakDays || 0;

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayNames = ['일','월','화','수','목','금','토'];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevLastDate - firstDay + 1 + i, type: 'prev' });
  for (let i = 1; i <= lastDate; i++) cells.push({ day: i, type: 'current' });
  const totalCells = cells.length <= 35 ? 35 : 42;
  for (let i = 1; i <= totalCells - cells.length; i++) cells.push({ day: i, type: 'next' });

  const isExercisedDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workedOutDates.includes(dateStr);
  };

  const exercisedDaysInMonth = cells
    .filter((c) => c.type === 'current' && isExercisedDate(c.day))
    .map((c) => c.day);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      backgroundColor: '#eef1f4',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit',
    }}>
      {/* 상단 파란 영역 */}
      <div style={{ backgroundColor: '#BFE8F8', height: 'clamp(60px, 10dvh, 80px)', flexShrink: 0 }} />
      <div style={{ height: '1.5px', backgroundColor: '#002738', flexShrink: 0 }} />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* 캘린더 카드 */}
        <div style={{
          margin: 'clamp(16px, 4vw, 24px) auto 0',
          width: 'calc(100% - clamp(32px, 10vw, 64px))',
          maxWidth: '318px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(12px, 3.5vw, 16px)',
          border: '1.5px solid #8EB3C2',
          boxSizing: 'border-box',
        }}>

          {/* 월/년 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(12px, 3.5vw, 18px)' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={BackForward} alt="이전" style={{ width: 'clamp(16px, 5vw, 20px)', height: 'clamp(16px, 5vw, 20px)', objectFit: 'contain' }} />
            </button>
            <div style={{ display: 'flex', gap: 'clamp(4px, 2vw, 8px)' }}>
              <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}
                style={{ width: 'clamp(70px, 22vw, 87px)', height: '28px', boxSizing: 'border-box', padding: '0px 6px', borderRadius: '8px', border: '1px solid #8EB3C2', fontSize: 'clamp(10px, 3vw, 12px)', color: '#002738', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}
                style={{ width: 'clamp(70px, 22vw, 87px)', height: '28px', boxSizing: 'border-box', padding: '0px 6px', borderRadius: '8px', border: '1px solid #8EB3C2', fontSize: 'clamp(10px, 3vw, 12px)', color: '#002738', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={BackForward} alt="다음" style={{ width: 'clamp(16px, 5vw, 20px)', height: 'clamp(16px, 5vw, 20px)', objectFit: 'contain', transform: 'scaleX(-1)' }} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
            {dayNames.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 'clamp(10px, 3vw, 12px)', color: '#8EB3C2', paddingBottom: '4px' }}>{d}</div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((cell, idx) => {
              const isExercised = cell.type === 'current' && isExercisedDate(cell.day);
              const isCurrent = cell.type === 'current';
              const sorted = [...exercisedDaysInMonth].sort((a, b) => a - b);
              const isFirst = isExercised && cell.day === sorted[0];
              const isLast = isExercised && cell.day === sorted[sorted.length - 1];
              const isMiddle = isExercised && !isFirst && !isLast;
              return (
                <div key={idx}
                  onClick={() => isCurrent && navigate('/DayRecord', { state: { day: cell.day, month: currentMonth, year: currentYear } })}
                  style={{
                    height: 'clamp(28px, 8vw, 36px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: isFirst || isLast ? '#8EB3C2' : isMiddle ? '#F5F5F5' : 'transparent',
                    fontSize: 'clamp(9px, 2.8vw, 11px)',
                    fontWeight: isExercised ? '700' : '500',
                    color: isFirst || isLast ? '#ffffff' : isMiddle ? '#8EB3C2' : isCurrent ? '#002738' : '#8EB3C2',
                    cursor: isCurrent ? 'pointer' : 'default',
                  }}>
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ height: '1.5px', backgroundColor: '#002738', margin: 'clamp(16px, 4vw, 24px) 0' }} />

        {/* 하단 캐릭터 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 'clamp(20px, 5vw, 30px)' }}>
          <img src={GhostRunning} alt="character" style={{ width: 'clamp(140px, 46vw, 186px)', marginBottom: '16px' }} />
          <p style={{ fontSize: 'clamp(18px, 6vw, 24px)', fontWeight: '800', color: '#002738', margin: 0 }}>
            {streakDays}일째 운동중
          </p>
        </div>

      </div>
    </div>
  );
}

export default Calendar;