import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
import { getSessionByDate } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function DayRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { day, month, year } = location.state || { day: 15, month: 2, year: 2026 };

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // month는 화면에서 0-indexed로 다루고 있어서(달력 등) +1 해서 실제 월로 변환
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    getSessionByDate(dateStr)
      .then(data => { if (!cancelled) setSession(data); })
      .catch(e => { if (!cancelled) setError(e.message || '운동 기록을 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [day, month, year]);

  const totalSec = session?.totalDurationSec || 0;
  const totalHour = Math.floor(totalSec / 3600);
  const totalMin = Math.floor((totalSec % 3600) / 60);
  const totalCal = Math.round(session?.totalCalories || 0);
  const tracks = session?.tracks || [];

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  };

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

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#FFF' }}>
        <p style={{ color: '#8B95A1', fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', backgroundColor: '#1E59DA', color: '#fff', cursor: 'pointer' }}>
          돌아가기
        </button>
      </div>
    );
  }

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
        {tracks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#AAA', fontSize: 14, padding: '40px 0' }}>
            이 날의 운동 기록이 없어요.
          </p>
        ) : (
          <>
            <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '10px', marginBottom: '24px' }}>
              <DataRow label="총 운동 시간" value={`${totalHour}시간 ${totalMin}분`} isMain />
              {tracks.map(t => (
                <DataRow key={t.trackId ?? t.exerciseName} label={t.exerciseName} value={formatDuration(t.elapsedSec || 0)} />
              ))}
            </div>

            <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '10px', marginBottom: '24px' }}>
              <DataRow label="소모 칼로리" value="" isMain />
              {tracks.map(t => (
                <DataRow key={t.trackId ?? t.exerciseName} label={t.exerciseName} value={`${Math.round(t.calories || 0)} kcal`} />
              ))}
            </div>

            <DataRow label="총 소모 칼로리" value={`${totalCal} kcal`} isMain />
          </>
        )}
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