import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '../assets/Icon/HomeIcon.png';
import { updateTrack, endSession, getLatestCoaching } from '../api';

function Page8({ elapsed, setIsRunning, selectedExercise }) {
  const navigate = useNavigate();
  const sessionData = selectedExercise?.sessionData;
  const tracks = sessionData?.tracks || [];

  // trackId → elapsedSec 로컬 타이머
  const [trackElapsed, setTrackElapsed] = useState({});
  const [playing, setPlaying] = useState({});
  const [aiRoutine, setAiRoutine] = useState([]);

  useEffect(() => {
    getLatestCoaching()
      .then(data => {
        if (data?.recommendedRoutine) {
          const parsed = JSON.parse(data.recommendedRoutine);
          setAiRoutine(parsed.routines || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 트랙별 재생 상태로 전체 isRunning 제어
    setIsRunning(Object.values(playing).some((v) => v));
  }, [playing]);

  // 트랙 재생/일시정지 토글 (한 번에 하나만 재생)
  const togglePlay = async (trackId) => {
    const nowPlaying = !playing[trackId];

    // 다른 트랙 모두 일시정지
    if (nowPlaying) {
      const pausePromises = Object.keys(playing)
        .filter((id) => playing[id] && id !== String(trackId))
        .map((id) => {
          if (id !== 'null') {
            return updateTrack(Number(id), 'paused', trackElapsed[id] || 0).catch(() => {});
          }
        });
      await Promise.all(pausePromises);

      setPlaying((prev) => {
        const reset = Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: false }), {});
        return { ...reset, [trackId]: true };
      });
    } else {
      setPlaying((prev) => ({ ...prev, [trackId]: false }));
    }

    const currentElapsed = trackElapsed[trackId] || 0;
    const status = nowPlaying ? 'running' : 'paused';

    if (trackId) {
      try {
        await updateTrack(trackId, status, currentElapsed);
      } catch (e) { /* 오프라인 시 무시 */ }
    }
  };

  // 트랙별 타이머
  useEffect(() => {
    const intervals = {};
    Object.keys(playing).forEach((id) => {
      if (playing[id]) {
        intervals[id] = setInterval(() => {
          setTrackElapsed((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        }, 1000);
      }
    });
    return () => Object.values(intervals).forEach(clearInterval);
  }, [playing]);

  const handleEnd = async () => {
    setIsRunning(false);
    try {
      // 재생 중인 트랙들 먼저 pause 처리 (경과 시간 저장)
      const pausePromises = Object.keys(playing)
        .filter((id) => playing[id] && id !== 'null')
        .map((id) => updateTrack(Number(id), 'paused', trackElapsed[id] || 0).catch(() => {}));
      await Promise.all(pausePromises);
      await endSession();
    } catch (e) { /* 무시 */ }
    navigate('/Page3');
  };

  const formatTime = (sec) => {
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 로컬 UI용 items (백엔드 트랙 또는 fallback)
  const displayItems = tracks.length > 0
    ? tracks.map((t) => ({ id: t.trackId, name: t.exerciseName, calories: t.calories }))
    : (selectedExercise?.items || []).map((name) => ({ id: null, name }));

  return (
    <div style={{ width: '401px', height: '874px', overflow: 'hidden', fontFamily: 'inherit', backgroundColor: '#0a0e1a' }}>
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>

        {/* 상단 다크 영역 */}
        <div style={{ backgroundColor: '#0a0e1a', padding: '20px 20px 36px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* 홈 버튼 */}
          <button onClick={handleEnd} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}>
            <img src={HomeIcon} alt="홈" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </button>

          {/* 스톱워치 */}
          <div style={{ position: 'relative', width: '210px', height: '210px', marginTop: '50px', marginBottom: '28px' }}>
            <svg width="210" height="210" style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx="105" cy="105" r="90" fill="none" stroke="#ffffff" strokeWidth="18" />
              <circle cx="105" cy="105" r="90" fill="none" stroke="#44CBFF" strokeWidth="18" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - (elapsed % 60) / 60)}`}
                transform="rotate(-90 105 105)"
                style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px', fontWeight: '700', color: '#ffffff', letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(elapsed)}
              </span>
            </div>
          </div>

          {/* 칼로리 */}
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>
            {sessionData?.totalCalories ? `${Math.round(sessionData.totalCalories)} Kcal 소모` : '129 Kcal 소모 예상'}
          </p>
          <p style={{ color: '#aabbcc', fontSize: '11px', margin: '0 0 22px', textAlign: 'center', padding: '0 20px' }}>
            칼로리는 추정치이며 실제 소모량과 차이가 있을 수 있습니다.
          </p>

          {/* 운동 끝내기 */}
          <button onClick={handleEnd}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            style={{
              borderRadius: '29px', border: '5px solid #ffffff',
              backgroundColor: '#BFE8F8', color: '#002738',
              width: '124px', height: '51px', fontSize: '16px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 0.1s',
            }}>
            운동 끝내기
          </button>
        </div>

        {/* 하단 운동 카드 */}
        <div style={{ backgroundColor: '#0a0e1a', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayItems.map((item) => {
            const key = item.id ?? item.name;
            const isPlaying = playing[key];
            return (
              <div key={key} style={{
                backgroundColor: '#BFE8F8', borderRadius: '15px', border: '8px solid #ffffff',
                padding: '0 20px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#002738' }}>{item.name}</span>
                  {trackElapsed[key] > 0 && (
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#002738' }}>
                      {formatTime(trackElapsed[key])}
                    </p>
                  )}
                </div>
                <button onClick={() => togglePlay(item.id)}
                  style={{
                    width: '57px', height: '57px', borderRadius: '50%', border: 'none',
                    backgroundColor: '#57D0FF', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(91,191,234,0.4)',
                  }}>
                  {isPlaying ? (
                    <svg width="41" height="41" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="5" height="14" rx="2" fill="white" />
                      <rect x="12" y="3" width="5" height="14" rx="2" fill="white" />
                    </svg>
                  ) : (
                    <svg width="41" height="41" viewBox="0 0 20 20" fill="none">
                      <path d="M5 3.5C5 2.7 5.87 2.23 6.53 2.66L17.06 9.16C17.67 9.56 17.67 10.44 17.06 10.84L6.53 17.34C5.87 17.77 5 17.3 5 16.5V3.5Z" fill="white" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}

          {/* AI 추천 루틴 */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: '#002738', textAlign: 'center' }}>AI 추천 루틴</p>
            {aiRoutine.length > 0 ? (
              <div style={{ border: '1.5px solid #002738', borderRadius: '12px', padding: '14px 16px', backgroundColor: '#D9D9D9' }}>
                {aiRoutine.map((item, idx) => (
                  <div key={idx} style={{ textAlign: 'center', marginBottom: idx < aiRoutine.length - 1 ? '8px' : 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#002738' }}>{item.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#002738' }}>{item.sets}세트 × {item.reps}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#8EB3C2', textAlign: 'center' }}>AI 코치 탭에서 맞춤 루틴을 받아보세요</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page8;

