import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
// import { getSessionByDate } from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner';

function DayRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { day, month, year } = location.state || { day: 15, month: 2, year: 2026 };
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyData = {
      totalDurationSec: 10020,
      totalCalories: 797,
      tracks: [
        { exerciseName: '러닝', elapsedSec: 3600, calories: 512 },
        { exerciseName: '걷기', elapsedSec: 6420, calories: 285 },
      ]
    };

    const timer = setTimeout(() => {
      setSession(dummyData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [day, month, year]);

  const totalSec = session?.totalDurationSec || 0;
  const totalHour = Math.floor(totalSec / 3600);
  const totalMin = Math.floor((totalSec % 3600) / 60);
  const totalCal = Math.round(session?.totalCalories || 0);

  // 1. Badge 컴포넌트 (오류 수정 및 로직 정리)
  const Badge = ({ children, type }) => {
    let style = {
      padding: '6px 14px',
      borderRadius: '10px', 
      fontSize: '13px', 
      fontWeight: '700', 
      width: 'fit-content', 
      minWidth: '80px', 
      textAlign: 'center',
      display: 'inline-block'
    };

    if (type === 'main') {
      style = { ...style, backgroundColor: '#8E8E8E', color: '#FFF' };
    } else if (children === '러닝') {
      style = { ...style, backgroundColor: '#EAEAEA', color: '#8E8E8E' };
    } else if (children === '걷기') {
      style = { ...style, backgroundColor: '#EAEAEA', color: '#8E8E8E' };
    } else {
      style = { ...style, backgroundColor: '#EAEAEA', color: '#8E8E8E' };
    }

    return <div style={style}>{children}</div>;
  };

  // 2. DataRow 컴포넌트 (Badge 컴포넌트 밖으로 이동)
  const DataRow = ({ label, value, isMain = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' }}>
      <Badge type={isMain ? 'main' : 'sub'}>{label}</Badge>
      <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>{value}</span>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ width: '100%', height:'100%', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column' }}>
      
      {/* 헤더 */}
      <div style={{ padding: '60px 24px 20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{
            width: '10px', height: '18px', backgroundColor: '#1E59DA',
            maskImage: `url(${BackForward})`, WebkitMaskImage: `url(${BackForward})`,
            maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
            maskSize: 'contain', WebkitMaskSize: 'contain'
          }} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '20px', fontWeight: '800', color: '#1A1A1A', transform: 'translateX(-5px)' }}>
          {year}년 {month + 1}월 {day}일 운동 기록
        </h1>
      </div>

      {/* 상세 데이터 리스트 */}
      <div style={{ flex: 1, padding: '20px 24px' }}>
        <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '10px', marginBottom: '24px' }}>
          <DataRow label="총 운동 시간" value={`${totalHour}시간 ${totalMin}분`} isMain />
          <DataRow label="러닝" value="1시간" />
          <DataRow label="걷기" value="1시간 47분" />
        </div>

        <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '10px', marginBottom: '24px' }}>
          <DataRow label="소모 칼로리" value="" isMain />
          <DataRow label="러닝" value="512 kcal" />
          <DataRow label="걷기" value="285 kcal" />
        </div>

        <DataRow label="총 소모 칼로리" value={`${totalCal} kcal`} isMain />
      </div>

      {/* 하단 버튼 */}
      <div style={{ padding: '24px 24px 40px', textAlign: 'center' }}>
        <button style={{
          width: '93%', height: '40px',
          backgroundColor: '#2563EB', color: '#FFF', border: 'none',
          borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer'
        }}>
          수정하기
        </button>
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#AAA', lineHeight: '1.5' }}>
          운동 기록은 실제 측정값 기준으로, 하향 조정만 가능합니다.
        </p>
      </div>
    </div>
  );
}

export default DayRecord;