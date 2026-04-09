import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/Components/Page2.svg';
import BackForward from '../assets/Icon/BackForward.svg';
import { register, updateProfile, getToken, getUserName } from '../api';

function Page2() {
  const navigate = useNavigate();
  const isEdit = !!getToken(); // 토큰 있으면 수정 모드

  const [userInfo, setUserInfo] = useState({
    name: '',
    birth: '',
    height: '',
    weight: '',
    gender: '',
    goalWeek: '',
    goalTime: '',
    goalCal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleConfirm = async () => {
    if (!userInfo.name || !userInfo.birth || !userInfo.gender || !userInfo.height || !userInfo.weight) {
      setError('모든 기본 정보를 입력해주세요');
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

  const inputStyle = {
    position: 'absolute',
    background: 'none', border: 'none', outline: 'none',
    fontSize: '20px', textAlign: 'center',
    color: '#002738', padding: '0',
    fontFamily: 'inherit', fontWeight: '500',
  };
  const goalInputStyle = {
    background: 'none', border: 'none', outline: 'none',
    fontSize: '20px', fontWeight: '700', textAlign: 'center',
    color: '#002738', width: '44px', padding: '0', fontFamily: 'inherit',
  };
  const genderBtnBase = {
    width: '160px', height: '64px', borderRadius: '15px',
    fontFamily: 'inherit', fontWeight: '700', fontSize: '20px',
    color: '#002738', cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s',
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: '100% 100%', position: 'relative',
    }}>
      {/* 뒤로가기 */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '60px', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '30px', fontWeight: 'bold', color: '#002738' }}>
          <img src={BackForward} alt="이전" style={{ width: '10px', height: '20px', objectFit: 'contain' }} />
        </button>
      </div>

      {/* 1. 이름 */}
      <input name="name" value={userInfo.name} onChange={handleChange} placeholder="홍길동"
        style={{ ...inputStyle, left: '40px', top: '188px', width: '331px', height: '66px' }} />

      {/* 2. 생년월일 */}
      <input name="birth" type="date" value={userInfo.birth} onChange={handleChange}
        style={{ ...inputStyle, left: '125px', top: '298px', width: '200px', height: '40px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }} />

      {/* 3. 성별 */}
      <div style={{ position: 'absolute', left: '32px', top: '384px', display: 'flex', gap: '10px' }}>
        {['male', 'female'].map((g) => (
          <button key={g} onClick={() => setUserInfo({ ...userInfo, gender: g })}
            style={{ ...genderBtnBase, border: userInfo.gender === g ? '2px solid #BFE8F8' : '1px solid #ddd', backgroundColor: userInfo.gender === g ? '#BFE8F8' : '#ffffff' }}>
            {g === 'male' ? '남성' : '여성'}
          </button>
        ))}
      </div>

      {/* 4. 키 */}
      <div style={{ position: 'absolute', left: '15px', top: '496px', width: '200px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <span style={{ color: '#002738', fontSize: '20px', fontWeight: '700' }}>키</span>
        <input name="height" type="number" value={userInfo.height} onChange={handleChange} placeholder="000"
          style={{ ...inputStyle, position: 'relative', width: '70px', height: '40px' }} />
        <span style={{ color: '#002738', fontSize: '20px', fontWeight: '500' }}>cm</span>
      </div>

      {/* 5. 몸무게 */}
      <div style={{ position: 'absolute', left: '185px', top: '496px', width: '200px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <span style={{ color: '#002738', fontSize: '20px', fontWeight: '700' }}>몸무게</span>
        <input name="weight" type="number" value={userInfo.weight} onChange={handleChange} placeholder="00"
          style={{ ...inputStyle, position: 'relative', width: '50px', height: '40px' }} />
        <span style={{ color: '#002738', fontSize: '20px', fontWeight: '500' }}>kg</span>
      </div>

      {/* 6. 목표 */}
      <div style={{ position: 'absolute', left: '35px', top: '620px', width: '331px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', color: '#002738', fontSize: '20px', fontWeight: '700', fontFamily: 'inherit' }}>
        <span>주</span>
        <input type="text" placeholder="00" value={userInfo.goalWeek} onChange={(e) => setUserInfo({ ...userInfo, goalWeek: e.target.value })} style={goalInputStyle} />
        <span>회 _</span>
        <input type="text" placeholder="00" value={userInfo.goalTime} onChange={(e) => setUserInfo({ ...userInfo, goalTime: e.target.value })} style={goalInputStyle} />
        <span>시간 _</span>
        <input type="text" placeholder="000" value={userInfo.goalCal} onChange={(e) => setUserInfo({ ...userInfo, goalCal: e.target.value })} style={{ ...goalInputStyle, width: '52px' }} />
        <span>칼로리</span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p style={{ position: 'absolute', left: '33px', top: '720px', color: '#e53e3e', fontSize: '14px', margin: 0 }}>{error}</p>
      )}

      {/* 7. 완료 버튼 */}
      <button onClick={handleConfirm} disabled={loading}
        onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          position: 'absolute', left: '33px', top: '742px', width: '331px', height: '66px',
          backgroundColor: loading ? '#ccc' : '#BFE8F8', borderRadius: '9px', border: 'none',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          color: '#002738', fontSize: '20px', fontWeight: '700', fontFamily: 'inherit',
          cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.1s ease-in-out',
        }}>
        {loading ? '저장 중...' : '확 인'}
      </button>
    </div>
  );
}

export default Page2;
