import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
import { register, updateProfile, getToken, checkNickname } from '../api';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

function Page2() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!getToken();

  const [userInfo, setUserInfo] = useState({
    name: location.state?.name || '',
    birth: '',
    height: '',
    weight: '',
    gender: '',
    goalWeek: '',
    goalTime: '',
    goalCal: '',
    kakaoId: location.state?.kakaoId || null,
  });

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const m = String(birthMonth).padStart(2, '0');
      const d = String(birthDay).padStart(2, '0');
      setUserInfo((prev) => ({ ...prev, birth: `${birthYear}-${m}-${d}` }));
    }
  }, [birthYear, birthMonth, birthDay]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    if (name === 'name') {
      setNicknameStatus(null);
      setNicknameError('');
    }
  };

  const handleCheckNickname = async () => {
    const name = userInfo.name.trim();
    if (!name) {
      setNicknameError('닉네임을 먼저 입력해주세요');
      return;
    }
    setCheckingNickname(true);
    setNicknameError('');
    try {
      const { available } = await checkNickname(name);
      setNicknameStatus(available ? 'available' : 'taken');
    } catch (e) {
      setNicknameStatus(null);
      setNicknameError(e.message || '중복 확인에 실패했어요. 다시 시도해주세요.');
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleNameBlur = () => {
    if (!userInfo.name.trim() || nicknameStatus || checkingNickname) return;
    handleCheckNickname();
  };

  const handleConfirm = async () => {
    if (!userInfo.name || !userInfo.birth || !userInfo.gender || !userInfo.height || !userInfo.weight) {
      setError('모든 기본 정보를 입력해주세요');
      return;
    }
    if (!isEdit && nicknameStatus === 'taken') {
      setError('이미 사용 중인 닉네임이에요');
      return;
    }
    if (!isEdit && nicknameStatus !== 'available') {
      setError('닉네임 중복 확인 버튼을 눌러주세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await updateProfile(userInfo);
      } else {
        await register(userInfo);
      }
      navigate('/Page3');
    } catch (e) {
      setError(e.message || '오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 공통 스타일 ─────────────────────────────
  const sectionLabel = {
    fontSize: '17px',
    fontWeight: '700',
    color: '#131F3C',
    margin: '0 0 12px',
  };

  const whiteInputBase = {
    backgroundColor: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1E59DA',
    fontFamily: 'inherit',
    padding: '0 16px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#E9EAEF',
      boxSizing: 'border-box',
      position: 'relative',
      paddingBottom: '120px',
    }}>
      {/* 뒤로가기 */}
      <div style={{
        width: '100%', height: '60px',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={BackForward} alt="이전" style={{ width: '16px', height: '30px' }} />
        </button>
      </div>

      <div style={{ padding: '20px 24px 0', boxSizing: 'border-box' }}>

        {/* 타이틀 */}
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#131F3C', lineHeight: '1.4', margin: '20px 0 40px' }}>
          서비스를 이용하기 위해서는<br />
          <span style={{ color: '#1E59DA' }}>기본 정보</span>가 필요해요!
        </h1>

        {/* 1. 닉네임 */}
        <div style={{ marginBottom: '32px' }}>
          <p style={sectionLabel}>닉네임</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              onBlur={handleNameBlur}
              placeholder="닉네임을 입력해주세요"
              style={{ ...whiteInputBase, flex: 1, height: '52px' }}
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={checkingNickname || !userInfo.name.trim()}
              style={{
                flexShrink: 0,
                padding: '0 14px',
                height: '52px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#1E59DA',
                backgroundColor: '#DCE8FF',
                border: 'none',
                borderRadius: '12px',
                cursor: checkingNickname ? 'default' : 'pointer',
                opacity: checkingNickname || !userInfo.name.trim() ? 0.5 : 1,
              }}
            >
              {checkingNickname ? '확인 중...' : '중복확인'}
            </button>
          </div>
          {nicknameStatus && (
            <p style={{
              margin: '8px 4px 0', fontSize: '12px', fontWeight: '600',
              color: nicknameStatus === 'available' ? '#1E59DA' : '#e53e3e',
            }}>
              {nicknameStatus === 'available' ? '✓ 사용 가능한 닉네임이에요' : '✗ 이미 사용 중인 닉네임이에요'}
            </p>
          )}
          {nicknameError && (
            <p style={{ margin: '8px 4px 0', fontSize: '12px', fontWeight: '600', color: '#e53e3e' }}>
              {nicknameError}
            </p>
          )}
        </div>

        {/* 2. 생년월일 */}
        <div style={{ marginBottom: '32px' }}>
          <p style={sectionLabel}>생년월일</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
              style={{ ...whiteInputBase, flex: 1, height: '52px', color: birthYear === '' ? '#B0B8C1' : '#1E59DA' }}>
              <option value="" disabled hidden>년도</option>
              {years.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
              style={{ ...whiteInputBase, flex: 1, height: '52px', color: birthMonth === '' ? '#B0B8C1' : '#1E59DA' }}>
              <option value="" disabled hidden>월</option>
              {months.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
              style={{ ...whiteInputBase, flex: 1, height: '52px', color: birthDay === '' ? '#B0B8C1' : '#1E59DA' }}>
              <option value="" disabled hidden>일</option>
              {days.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
        </div>

        {/* 3. 성별 */}
        <div style={{ marginBottom: '32px' }}>
          <p style={sectionLabel}>성별</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['male', 'female'].map((g) => (
              <button key={g} onClick={() => setUserInfo({ ...userInfo, gender: g })}
                style={{
                  flex: 1, height: '52px', borderRadius: '12px',
                  fontFamily: 'inherit', fontWeight: '700', fontSize: '15px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: userInfo.gender === g ? '2px solid #1E59DA' : '1px solid #ddd',
                  color: userInfo.gender === g ? '#ffffff' : '#000000',
                  backgroundColor: userInfo.gender === g ? '#1E59DA' : '#ffffff',
                }}>
                {g === 'male' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 체형 정보 */}
        <div style={{ marginBottom: '32px' }}>
          <p style={sectionLabel}>체형 정보</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ ...whiteInputBase, flex: 1, height: '52px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input name="height" type="number" value={userInfo.height} onChange={handleChange} placeholder="170"
                style={{ border: 'none',textAlign: 'center', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '500', color: '#1E59DA', width: '100%' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#8B95A1', flexShrink: 0 }}>cm</span>
            </div>
            <div style={{ ...whiteInputBase, flex: 1, height: '52px', display: 'flex', alignItems: 'center', gap: '8px', }}>
              <input name="weight" type="number" value={userInfo.weight} onChange={handleChange} placeholder="55"
                style={{ border: 'none',textAlign: 'center', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '500', color: '#1E59DA', width: '100%' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#8B95A1', flexShrink: 0 }}>kg</span>
            </div>
          </div>
        </div>

        {/* 5. 목표 */}
        <div style={{ marginBottom: '24px' }}>
          <p style={sectionLabel}>목표</p>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 12px' }}>일일 목표량을 적어주세요!</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#131F3C' }}>주</span>
            <input type="text" placeholder="00" value={userInfo.goalWeek}
              onChange={(e) => setUserInfo({ ...userInfo, goalWeek: e.target.value })}
              style={{ ...whiteInputBase, width: '64px', height: '48px', textAlign: 'center', padding: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#131F3C' }}>회</span>

            <input type="text" placeholder="0" value={userInfo.goalTime}
              onChange={(e) => setUserInfo({ ...userInfo, goalTime: e.target.value })}
              style={{ ...whiteInputBase, width: '64px', height: '48px', textAlign: 'center', padding: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#131F3C' }}>시간</span>

            <input type="text" placeholder="000" value={userInfo.goalCal}
              onChange={(e) => setUserInfo({ ...userInfo, goalCal: e.target.value })}
              style={{ ...whiteInputBase, width: '64px', height: '48px', textAlign: 'center', padding: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#131F3C' }}>칼로리</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p style={{ color: '#e53e3e', fontSize: '13px', margin: '0 0 16px' }}>
            {error}
          </p>
        )}
      </div>

      {/* 6. 확인 버튼 (하단 고정) */}
      <div style={{
        position: 'fixed', bottom: '30px', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', padding: '0 24px', boxSizing: 'border-box',
      }}>
        <button onClick={handleConfirm} disabled={loading}
          onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          style={{
            width: '100%', maxWidth: '350px', height: '52px',
            backgroundColor: loading ? '#ccc' : '#1E59DA',
            borderRadius: '12px', border: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            color: '#ffffff', fontSize: '17px', fontWeight: '700', fontFamily: 'inherit',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.1s ease-in-out',
          }}>
          {loading ? '저장 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}

export default Page2;