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
import { getToken } from './api';
import AddFriends from './pages/AddFriends.jsx';
<<<<<<< HEAD
=======
import KakaoCallback from './pages/KakaoCallback.jsx';
>>>>>>> adf9cf9c38f534a2d3924cc36834007a0dc7c995
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
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
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
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
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
<<<<<<< HEAD
=======
          <Route path="/kakao/callback" element={<KakaoCallback />} />
>>>>>>> adf9cf9c38f534a2d3924cc36834007a0dc7c995




        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;

