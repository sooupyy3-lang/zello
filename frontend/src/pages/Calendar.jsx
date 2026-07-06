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
    getHome()
      .then(setHomeData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const streakDays = homeData?.streakDays || 0;

  const today = new Date(); // 실제 오늘 날짜
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜 계산 로직
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevLastDate - firstDay + 1 + i, type: 'prev' });
  for (let i = 1; i <= lastDate; i++) cells.push({ day: i, type: 'current' });
  const totalCells = cells.length <= 35 ? 35 : 42;
  for (let i = 1; i <= totalCells - cells.length; i++) cells.push({ day: i, type: 'next' });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const arrowBtnStyle = {
    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E8F2FF',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',color:'#1E59DA'
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: '#F5F6F8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 24px', boxSizing: 'border-box',
      fontFamily: 'inherit',
    }}>

      {/* 1. 상단 타이틀 영역 (오늘 날짜 표시) */}
      <div style={{ width: '100%', maxWidth: '340px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: '#1A1A1A' }}>
            {currentYear}년 {currentMonth + 1}월
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{streakDays}일째 운동중</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} style={arrowBtnStyle}>
            <img src={BackForward} alt="이전" style={{ width: '7.4px', height:'12px' }} />
          </button>
          <button onClick={nextMonth} style={arrowBtnStyle}>
            <img src={BackForward} alt="다음" style={{ width: '7.4px', height:'12px', transform: 'rotate(180deg)'}} />
          </button>
        </div>
      </div>

      {/* 2. 캘린더 카드 */}
      <div style={{
        width: '100%', maxWidth: '340px',
        backgroundColor: '#ffffff', borderRadius: '30px',
        padding: '30px 20px', marginBottom: '32px',
        boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '20px' }}>
          {dayNames.map((d, i) => (
            <div key={d} style={{ 
              textAlign: 'center', fontSize: '13px', fontWeight: '600', 
              color: i === 0 ? '#FF8B8B' : i === 6 ? '#8BA7FF' : '#BBB' 
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '12px' }}>
          {cells.map((cell, idx) => {
            const isToday = 
              cell.type === 'current' &&
              cell.day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <div key={idx}
                onClick={() => cell.type === 'current' && navigate('/DayRecord', { state: { day: cell.day, month: currentMonth, year: currentYear } })}
                style={{
                  height: '36px', width: '36px', margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: isToday ? '#E6F0FF' : 'transparent',
                  color: cell.type === 'current' ? (isToday ? '#1A1A1A' : '#333') : '#EEE',
                  fontSize: '14px', fontWeight: isToday ? '700' : '500',
                  cursor: cell.type === 'current' ? 'pointer' : 'default'
                }}>
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 목표 섹션 */}
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1A1A1A' }}>목표</h3>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', boxSizing: 'border-box' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>{streakDays}일째 운동중</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
            목표 시간까지 <span style={{ fontWeight: '700' }}>1시간</span> 남았습니다<br />
            목표 칼로리까지 <span style={{ fontWeight: '700' }}>312칼로리</span> 남았습니다
          </p>
          <div style={{ marginTop: '24px' }}>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '800' }}>진행률</span>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#EDF2F7', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '65%', height: '100%', backgroundColor: '#2563EB', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Calendar;