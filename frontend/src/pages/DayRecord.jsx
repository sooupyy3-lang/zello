import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
import { getSessionByDate, updateTrack } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function DayRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { day, month, year } = location.state || { day: 15, month: 2, year: 2026 };

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState({}); // trackId -> 수정 중인 분(minute) 값
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getSessionByDate(dateStr)
      .then(data => { if (!cancelled) setSession(data); })
      .catch(e => { if (!cancelled) setError(e.message || '운동 기록을 불러오지 못했어요.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [dateStr]);

  const loadSession = () => {
    setLoading(true);
    setError('');
    getSessionByDate(dateStr)
      .then(data => setSession(data))
      .catch(e => setError(e.message || '운동 기록을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  };

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

  const handleStartEdit = () => {
    const initial = {};
    tracks.forEach(t => {
      initial[t.trackId] = String(Math.floor((t.elapsedSec || 0) / 60));
    });
    setEditMinutes(initial);
    setSaveError('');
    setEditing(true);
  };

  const handleMinutesChange = (track, value) => {
    const originalMin = Math.floor((track.elapsedSec || 0) / 60);
    let n = parseInt(value, 10);
    if (Number.isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > originalMin) n = originalMin; // 하향 조정만 가능
    setEditMinutes(prev => ({ ...prev, [track.trackId]: String(n) }));
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const changed = tracks.filter(t => {
        const newMin = parseInt(editMinutes[t.trackId], 10) || 0;
        const originalMin = Math.floor((t.elapsedSec || 0) / 60);
        return newMin !== originalMin;
      });
      await Promise.all(
        changed.map(t => {
          const newSec = (parseInt(editMinutes[t.trackId], 10) || 0) * 60;
          return updateTrack(t.trackId, t.status, newSec);
        })
      );
      setEditing(false);
      loadSession(); // 수정된 최신 기록(총 시간/칼로리 포함)으로 다시 조회
    } catch (e) {
      setSaveError(e.message || '수정에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
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
  <img src={BackForward} alt="뒤로가기" style={{ width: '10px', height: '18px' }} />
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
                editing ? (
                  <div key={t.trackId ?? t.exerciseName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' }}>
                    <Badge type="sub">{t.exerciseName}</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min={0}
                        max={Math.floor((t.elapsedSec || 0) / 60)}
                        value={editMinutes[t.trackId] ?? ''}
                        onChange={e => handleMinutesChange(t, e.target.value)}
                        style={{ width: 56, padding: '6px 8px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 14, color: '#1A1A1A' }}>분</span>
                    </div>
                  </div>
                ) : (
                  <DataRow key={t.trackId ?? t.exerciseName} label={t.exerciseName} value={formatDuration(t.elapsedSec || 0)} />
                )
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
        {saveError && (
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#e53e3e' }}>{saveError}</p>
        )}
        {editing ? (
          <div style={{ display: 'flex', gap: 10, width: '93%', margin: '0 auto' }}>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              style={{
                flex: 1, height: '40px',
                backgroundColor: '#EAEAEA', color: '#333', border: 'none',
                borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: saving ? 'default' : 'pointer'
              }}
            >
              취소
            </button>
            <button
              onClick={handleSaveEdits}
              disabled={saving || tracks.length === 0}
              style={{
                flex: 1, height: '40px',
                backgroundColor: saving ? '#9DB8E8' : '#2563EB', color: '#FFF', border: 'none',
                borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: saving ? 'default' : 'pointer'
              }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            disabled={tracks.length === 0}
            style={{
              width: '93%', height: '40px',
              backgroundColor: tracks.length === 0 ? '#B0BEC5' : '#2563EB', color: '#FFF', border: 'none',
              borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: tracks.length === 0 ? 'default' : 'pointer'
            }}
          >
            수정하기
          </button>
        )}
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#AAA', lineHeight: '1.5' }}>
          운동 기록은 실제 측정값 기준으로, 하향 조정만 가능합니다.
        </p>
      </div>
    </div>
  );
}

export default DayRecord;