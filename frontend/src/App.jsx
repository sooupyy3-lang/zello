import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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
import AiResult from './pages/AiResult';
import MyPage from './pages/MyPage';
import Friends from './pages/Friends';
import { getToken } from './api';

function App() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <BrowserRouter>
      <div style={{
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
            <Route path="/AiUpload" element={<AiUpload />} />
            <Route path="/AiResult" element={<AiResult />} />
            <Route path="/MyPage" element={<MyPage />} />
            <Route path="/Friends" element={<Friends />} />

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

