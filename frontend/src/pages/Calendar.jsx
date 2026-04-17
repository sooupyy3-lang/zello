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

  // workedOutDates: ["2025-04-09", ...] 형식
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
    <div style={{ width: '100%', height: '100%', backgroundColor: '#eef1f4', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ backgroundColor: '#BFE8F8', height: '80px', flexShrink: 0 }} />
      <div style={{ height: '1.5px', backgroundColor: '#002738', flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ margin: '24px auto 0', width: '318px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1.5px solid #8EB3C2', boxSizing: 'border-box' }}>
          {/* 월/년 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={BackForward} alt="이전" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}
                style={{ width: 87, height: 28, boxSizing: 'border-box', padding: '0px 6px', borderRadius: '8px', border: '1px solid #8EB3C2', fontSize: '12px', color: '#002738', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}
                style={{ width: 87, height: 28, boxSizing: 'border-box', padding: '0px 6px', borderRadius: '8px', border: '1px solid #8EB3C2', fontSize: '12px', color: '#002738', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={BackForward} alt="다음" style={{ width: '20px', height: '20px', objectFit: 'contain', transform: 'scaleX(-1)' }} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
            {dayNames.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#8EB3C2', paddingBottom: '4px' }}>{d}</div>
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
                    height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: isFirst || isLast ? '#8EB3C2' : isMiddle ? '#F5F5F5' : 'transparent',
                    fontSize: '11px', fontWeight: isExercised ? '700' : '500',
                    color: isFirst || isLast ? '#ffffff' : isMiddle ? '#8EB3C2' : isCurrent ? '#002738' : '#8EB3C2',
                    cursor: isCurrent ? 'pointer' : 'default',
                  }}>
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: '1.5px', backgroundColor: '#002738', margin: '24px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '30px' }}>
          <img src={GhostRunning} alt="character" style={{ width: '186px', marginBottom: '16px' }} />
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#002738', margin: 0 }}>
            {streakDays}일째 운동중
          </p>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
