import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Backimg from '../assets/Icon/BackForward.svg';
import { updateTrack, endSession, getLatestCoaching, getActiveFriends } from '../api';
function formatElapsedSince(startedAt) {
  if (!startedAt) return '-';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Page8({ elapsed, setIsRunning, selectedExercise }) {
  const navigate = useNavigate();
  const sessionData = selectedExercise?.sessionData;
  const tracks = sessionData?.tracks || [];

  const [trackElapsed, setTrackElapsed] = useState({});
  const [playing, setPlaying] = useState({});
  const [aiRoutine, setAiRoutine] = useState([]);
  const [activeFriends, setActiveFriends] = useState([]);


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
    setIsRunning(Object.values(playing).some((v) => v));
  }, [playing]);

  const togglePlay = async (item) => {
    // key를 item 객체에서 일관되게 추출
    const trackId = item.id !== null ? item.id : item.name;
    const nowPlaying = !playing[trackId];

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

    if (item.id !== null) {
      try {
        await updateTrack(item.id, status, currentElapsed);
      } catch (e) {}
    }
  };

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
      const pausePromises = Object.keys(playing)
        .filter((id) => playing[id] && id !== 'null')
        .map((id) => updateTrack(Number(id), 'paused', trackElapsed[id] || 0).catch(() => {}));
      await Promise.all(pausePromises);
      await endSession();
    } catch (e) {}
    navigate('/Page3');
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const displayItems = tracks.length > 0
    ? tracks.map((t) => ({ id: t.trackId, name: t.exerciseName, calories: t.calories, metValue: t.metValue }))
    : (selectedExercise?.items || []).map((name) => ({ id: null, name }));

  const userWeightKg = sessionData?.userWeightKg ?? 60;

  // 모든 항목의 누적 시간 합산 칼로리 (재생/정지와 무관하게 계속 증가)
  const totalCalories = displayItems.reduce((sum, item) => {
    const key = item.id !== null ? item.id : item.name;
    const elapsedSec = trackElapsed[key] || 0;
    const met = item.metValue || 3.5;
    return sum + met * userWeightKg * 0.0175 * (elapsedSec / 60);
  }, 0);

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      backgroundColor: '#0a0e1a',
      fontFamily: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
    }}>

      {/* 영역 1: 상단 헤더 */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: 56,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>

        <button
          onClick={handleEnd}
          style={{
            position: 'absolute',
            top: 16, left: 16,
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}
        >
          <img
            src={Backimg}
            alt="뒤로"
            style={{
              width: 'clamp(24px, 7vw, 28px)',
              height: 'clamp(24px, 7vw, 28px)',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
            }}
          />
        </button>

        <span style={{
          fontSize: 'clamp(32px, 8vw, 64px)',
          fontWeight: '600',
          color: '#ffffff',
          letterSpacing: '2px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTime(elapsed)}
        </span>

        {/* 한 번이라도 운동하면 총 소모 칼로리 표시, 이후 정지해도 유지 */}
        {totalCalories > 0 ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '700', margin: '0 0 6px' }}>
              {totalCalories.toFixed(1)} Kcal 소모 예상
            </p>
            <p style={{ color: '#DBE9F9', fontSize: 11, margin: 0, padding: '0 20px' }}>
              칼로리는 추정치이며 실제 소모량과 차이가 있을 수 있습니다.
            </p>
          </div>
        ) : (
          <div style={{ height: 22 }} />
        )}

        <button
          onClick={handleEnd}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          style={{
            width: '85%',
            height: 66,
            borderRadius: 29,
            border: 'none',
            backgroundColor: '#E6EEFF',
            color: '#1E59DA',
            fontSize: 'clamp(13px, 4vw, 16px)',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.1s',
          }}
        >
          운동 끝내기
        </button>
      </div>

      {/* 영역 2: 운동 카드 목록 */}
      <div style={{
        width: '100%',
        padding: '0 20px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {displayItems.map((item) => {
          //  togglePlay와 동일한 방식으로 key 추출
          const key = item.id !== null ? item.id : item.name;
          const isPlaying = !!playing[key];
          const timeRecorded = trackElapsed[key] || 0;

          return (
            <div
              key={key}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: '0 20px',
                height: 'clamp(80px, 20vw, 90px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '700', color: '#002738' }}>
                  {item.name}
                </span>
                {timeRecorded > 0 && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#002738' }}>
                    {formatTime(timeRecorded)}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* 정지 시 누적 시간, 재생 중엔 "진행중" */}
                <div style={{
                  backgroundColor: '#E6EEFF',
                  display: 'flex',
                  width: 70,
                  height: 29,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#1E59DA',
                }}>
                  {isPlaying ? '진행중' : formatTime(timeRecorded)}
                </div>

                {/*  background / backgroundColor 모두 transparent, appearance 초기화 */}
                <button
                  onClick={() => togglePlay(item)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                  }}
                >
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#1E59DA"/>
                      <path d="M8 8H16V16H8V8Z" fill="#1E59DA"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#1E59DA"/>
                      <path d="M10 17L16 12L10 7V17Z" fill="#1E59DA"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 영역 3: 운동 중인 친구 */}
      <div style={{
        width: '100%',
        padding: '0 20px 40px',
        boxSizing: 'border-box',
      }}>
        <p style={{ margin: '0 0 12px 4px', fontSize: 15, fontWeight: '500', color: '#ffffff' }}>
          운동 중인 친구
        </p>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: '24px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px 8px',
        }}>
          {activeFriends.length === 0 && (
  <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 13, color: '#ADB5BD', margin: 0 }}>
    지금 운동 중인 친구가 없어요.
  </p>
)}
{activeFriends.slice(0, 8).map((friend) => (
  <div key={friend.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
    <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="53" height="53" viewBox="0 0 53 53" fill="none">
<path
  fillRule="evenodd"
  clipRule="evenodd"
  d="M52.5 26.25C52.5 40.7479 40.7479 52.5 26.25 52.5C11.7521 52.5 0 40.7479 0 26.25C0 11.7521 11.7521 0 26.25 0C40.7479 0 52.5 11.7521 52.5 26.25ZM34.125 18.375C34.125 20.4636 33.2953 22.4666 31.8185 23.9435C30.3416 25.4203 28.3386 26.25 26.25 26.25C24.1614 26.25 22.1584 25.4203 20.6815 23.9435C19.2047 22.4666 18.375 20.4636 18.375 18.375C18.375 16.2864 19.2047 14.2834 20.6815 12.8065C22.1584 11.3297 24.1614 10.5 26.25 10.5C28.3386 10.5 30.3416 11.3297 31.8185 12.8065C33.2953 14.2834 34.125 16.2864 34.125 18.375ZM26.25 48.5625C30.7552 48.5697 35.1561 47.2065 38.8684 44.6539C40.4539 43.5645 41.1311 41.4907 40.2071 39.8029C38.2987 36.3037 34.3612 34.125 26.25 34.125C18.1388 34.125 14.2013 36.3037 12.2903 39.8029C11.3689 41.4907 12.0461 43.5645 13.6316 44.6539C17.3439 47.2065 21.7448 48.5697 26.25 48.5625Z"
  fill="#1E59DA"
/>      </svg>
    </div>
   
    <span style={{ fontSize: 10, fontWeight: '700', color: '#1E59DA' }}>
      {formatElapsedSince(friend.startedAt)}
      </span>
    

              <span style={{
                fontSize: 11,
                fontWeight: '600',
                color: friend.todayDone ? '#1E59DA' : '#ADB5BD',
                whiteSpace: 'nowrap',
              }}>
                {friend.name}
              </span>

              <span style={{
                fontSize: 10,
                fontWeight: '700',
                color: friend.todayDone ? '#1E59DA' : '#ADB5BD',
              }}>
                1:45:04
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Page8;