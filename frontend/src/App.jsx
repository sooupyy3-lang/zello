import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Layout from './pages/Layout.jsx';
import Home from './pages/Home';
import Start from './pages/Start';
import Login from './pages/Login';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page8 from './pages/Page8';
import Calendar from './pages/Calendar';
import AiCoach from './pages/AiCoach';
import DayRecord from './pages/DayRecord';
import AiUpload from './pages/AiUpload';
import Analyzing from './pages/Analyzing';
import AiResultEx from './pages/AiResultEx';
import AiResultBody from './pages/AiResultBody';
import MyPage from './pages/MyPage';
import Friends from './pages/Friends';
import { getToken, getTodaySession, endSession } from './api';

// 이 시간(초) 이상 연속으로 켜져 있으면 타이머를 강제 정지한다 (백엔드의 좀비 세션 자동 종료 기준과 동일)
const MAX_CONTINUOUS_SEC = 3 * 60 * 60;
import AddFriends from './pages/AddFriends.jsx';
import KakaoCallback from './pages/KakaoCallback.jsx';
import Group from './pages/Group.jsx';
import AddGroup from './pages/AddGroup.jsx';
import GroupExplore from './pages/GroupExplore.jsx';
import Groupdetail from './pages/Groupdetail.jsx';
import NewGroup from './pages/NewGroup.jsx';



function App() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const startTimeRef = useRef(null);
  const timerRef    = useRef(null);
  const wakeLockRef = useRef(null);

  // ── 앱 재실행 시 서버의 진행 중인 세션 기준으로 타이머 복원 ──
  // (탭을 완전히 닫았다 열거나 새로고침해도, 서버의 started_at으로 정확한 경과시간을 계산)
  useEffect(() => {
    getTodaySession()
      .then(session => {
        if (!session?.isActive || !session.startedAt) return;
        const start = new Date(session.startedAt).getTime();
        const secs = Math.floor((Date.now() - start) / 1000);
        if (secs >= MAX_CONTINUOUS_SEC) {
          // 3시간 넘게 방치된 세션 — 서버 스케줄러를 기다리지 않고 바로 종료 처리
          endSession().catch(() => {});
          return;
        }
        startTimeRef.current = start;
        setElapsed(secs);
        setSelectedExercise(prev => ({ ...(prev || {}), sessionData: session }));
        setIsRunning(true);
      })
      .catch(() => {});
  }, []);

  // ── 정확한 Date 기반 타이머 (백그라운드에서도 시간 유지) ──
  useEffect(() => {
    if (isRunning) {
      // 저장된 시작 시간 복원 (새로고침 대비)
      const saved = localStorage.getItem('workoutStartTime');
      if (saved && !startTimeRef.current) {
        startTimeRef.current = parseInt(saved);
      } else if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - elapsed * 1000;
        localStorage.setItem('workoutStartTime', String(startTimeRef.current));
      }
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (secs >= MAX_CONTINUOUS_SEC) {
          setElapsed(MAX_CONTINUOUS_SEC);
          setIsRunning(false);
          endSession().catch(() => {});
          return;
        }
        setElapsed(secs);
      }, 1000);

      // 화면 켜짐 유지 (Screen Wake Lock)
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
          .then(lock => { wakeLockRef.current = lock; })
          .catch(() => {});
      }
    } else {
      clearInterval(timerRef.current);
      startTimeRef.current = null;
      localStorage.removeItem('workoutStartTime');
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // ── 화면 복귀 시 즉시 시간 동기화 ──
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && isRunning && startTimeRef.current) {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (secs >= MAX_CONTINUOUS_SEC) {
          setElapsed(MAX_CONTINUOUS_SEC);
          setIsRunning(false);
          endSession().catch(() => {});
          return;
        }
        setElapsed(secs);
        // Wake Lock은 화면 복귀 시 재취득 필요
        if ('wakeLock' in navigator && !wakeLockRef.current) {
          navigator.wakeLock.request('screen')
            .then(lock => { wakeLockRef.current = lock; })
            .catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isRunning]);

  return (
    <BrowserRouter>
      <div 
      id="app-container"
      style={{
        width: '402px', height: '874px', margin: '0 auto',
        position: 'relative', backgroundColor: 'white',
        overflowX: 'hidden', overflowY: 'auto',
      }}>
        <Routes>
          {/* 하단바 있는 페이지 */}
          <Route element={<Layout />}>
            <Route path="/Page3" element={<Page3 elapsed={elapsed} isRunning={isRunning} />} />
            <Route path="/Page4" element={<Page4 setSelectedExercise={setSelectedExercise} />} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/AiCoach" element={<AiCoach />} />
            <Route path="/DayRecord" element={<DayRecord />} />
            <Route path="/MyPage" element={<MyPage />} />
            <Route path="/Friends" element={<Friends />} />
            <Route path="/AddFriends" element={<AddFriends />} />
            <Route path="/Group" element={<Group />} />
            <Route path="/AddGroup" element={<AddGroup />} />




          </Route>

          {/* 하단바 없는 페이지 */}
          <Route path="/" element={<Home />} />
          <Route path="/Start" element={<Start />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Page2" element={<Page2 />} />
          <Route path="/Page8" element={
            <Page8
              elapsed={elapsed}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              selectedExercise={selectedExercise}
            />
            
          } />

          <Route path="/Analyzing" element={<Analyzing />} />
          <Route path="/GroupExplore" element={<GroupExplore />} />
          <Route path="/Groupdetail" element={<Groupdetail />} />
          <Route path="/NewGroup" element={<NewGroup />} />
          <Route path="/AiUpload" element={<AiUpload />} />
          <Route path="/AiResultEx" element={<AiResultEx />} />
          <Route path="/AiResultBody" element={<AiResultBody />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />




        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;

