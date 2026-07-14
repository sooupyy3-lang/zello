import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../assets/Components/Page2.svg';
import BackForward from '../assets/Icon/BackForward.svg';
import { register, updateProfile, getToken, checkNickname } from '../api';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

function Page2() {
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!getToken(); // 토큰 있으면 수정 모드

    // 카카오 회원가입 흐름(KakaoCallback.jsx)에서 넘어온 경우 kakaoId/name을 미리 채워둠
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
    const [nicknameStatus, setNicknameStatus] = useState(null); // null | 'available' | 'taken'
    const [checkingNickname, setCheckingNickname] = useState(false);
    const [nicknameError, setNicknameError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
        if (name === 'name') {
            // 닉네임을 다시 수정하면 이전 확인 결과는 무효화
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

    // 입력창 포커스 아웃 시에도 보조적으로 자동 확인 (버튼을 못 누르고 넘어간 경우 대비)
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

    const inputStyle = {
        position: 'absolute',
        background: 'none', border: 'none', outline: 'none',
       fontSize: '15px', textAlign: 'center',
        color: '#1E59DA', padding: '0',
        fontFamily: 'inherit', fontWeight: '500',
    };
    const selectStyle = {
        background: 'none', border: 'none', outline: 'none',
         fontSize: '15px',fontWeight: '500', 
        color: '#1E59DA', fontFamily: 'inherit', cursor: 'pointer',
    };
    const genderBtnBase = {
        height: `calc(40 / 874 * 100vw)`,  width: `calc(323/402 * 100%)`, borderRadius: '15px',
        fontFamily: 'inherit', fontWeight: '700',
        fontSize: '15px',
        color: '#000000', cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s',
    };

    const goalInputStyle = {
        background: 'none', border: 'none', outline: 'none',
        fontSize: '15px',fontWeight: '700', textAlign: 'center',
        color: '#1E59DA', width: `calc(65/402 * 100%)`, padding: '0', fontFamily: 'inherit',
    };
    

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            backgroundColor:'#E9EAEF',
            position: 'relative',
            boxSizing: 'border-box',
            
        }}>
           <div style={{ position: 'relative', width: '100%', aspectRatio: '402 / 874' }}>
  
  {/* 뒤로가기 바를 absolute로 변경해서 도화지 안으로 편입 */}
  <div style={{ 
    position: 'absolute', 
    top: 0, 
    width: '100%', 
    height: '60px', 
    display: 'flex', 
    alignItems: 'center', 
    padding: '0 20px', 
    zIndex: 100 
  }}>
    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <img src={BackForward} alt="이전" style={{ width: '16px', height: '30px' }} />
    </button>
  </div>

  <div style={{
    position: 'absolute',
    top: `calc(290 / 874 * 100%)`,
    left: `calc(70 / 402 * 100%)`,
    width: `calc(300 / 402 * 100%)`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}>
    <input
      name="name"
      value={userInfo.name}
      onChange={handleChange}
      onBlur={handleNameBlur}
      placeholder="홍길동"
      style={{
        ...inputStyle,
        position: 'relative',
        top: 'auto',
        left: 'auto',
        width: '120px',
        fontSize: `calc(15 / 874 * 100vw)`,
      }}
    />
    <button
      type="button"
      onClick={handleCheckNickname}
      disabled={checkingNickname || !userInfo.name.trim()}
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#1E59DA',
        backgroundColor: '#E8F0FE',
        border: 'none',
        borderRadius: '8px',
        cursor: checkingNickname ? 'default' : 'pointer',
        opacity: checkingNickname || !userInfo.name.trim() ? 0.5 : 1,
      }}
    >
      {checkingNickname ? '확인 중...' : '중복확인'}
    </button>
  </div>
  {nicknameStatus && (
    <p style={{
      position: 'absolute',
      top: `calc(315 / 874 * 100%)`,
      left: `calc(70 / 402 * 100%)`,
      margin: 0,
      fontSize: `calc(11 / 874 * 100vw)`,
      fontWeight: '600',
      color: nicknameStatus === 'available' ? '#1E59DA' : '#e53e3e',
    }}>
      {nicknameStatus === 'available' ? '✓ 사용 가능한 닉네임이에요' : '✗ 이미 사용 중인 닉네임이에요'}
    </p>
  )}
  {nicknameError && (
    <p style={{
      position: 'absolute',
      top: `calc(315 / 874 * 100%)`,
      left: `calc(70 / 402 * 100%)`,
      margin: 0,
      fontSize: `calc(11 / 874 * 100vw)`,
      fontWeight: '600',
      color: '#e53e3e',
    }}>
      {nicknameError}
    </p>
  )}



                {/* 2. 생년월일 */}
                <div style={{ position: 'absolute',top: `calc(380 / 874 * 100%)`,left: `calc(50 / 402 * 100%)`,  width: `calc(320 / 402 * 100%)`, height: '6%',gap: `calc(50 / 402 * 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ ...selectStyle,width: `calc(100 / 402 * 100%)`,color: birthYear === "" ? "#B0B8C1" : "#1E59DA"   }}>
                        <option value=""disabled hidden>2003년</option>
                        {years.map((y) => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ ...selectStyle, width: `calc(94 / 402 * 100%)`,color: birthMonth === "" ? "#B0B8C1" : "#1E59DA" }}>
                        <option value=""disabled hidden>6월</option>
                        {months.map((m) => <option key={m} value={m}>{m}월</option>)}
                    </select>
                    <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ ...selectStyle,  width: `calc(94 / 402 * 100%)`,color: birthDay === "" ? "#B0B8C1" : "#1E59DA" }}>
                        <option value=""disabled hidden>10일</option>
                        {days.map((d) => <option key={d} value={d}>{d}일</option>)}
                    </select>
                </div>

                {/* 3. 성별 */}
                <div style={{ position: 'absolute', top: `calc(476 / 874 * 100%)`,left: `calc(39 / 402 * 100%)`,width: `calc(323 / 402 * 100%)`,  display: 'flex', gap: `calc(27 / 402 * 100%)` }}>
                    {['male', 'female'].map((g) => (
                        <button key={g} onClick={() => setUserInfo({ ...userInfo, gender: g })}
                                style={{ ...genderBtnBase, border: userInfo.gender === g ? '2px solid #1E59DA' : '1px solid #ddd',color: userInfo.gender === g ? "#ffffff" : "#000000" , backgroundColor: userInfo.gender === g ? '#1E59DA' : '#ffffff' }}>
                            {g === 'male' ? '남성' : '여성'}
                        </button>
                    ))}
                </div>

                {/* 4. 키 */}
                <div style={{ position: 'absolute', top: `calc(574 / 874 * 100%)`,left: `calc(38 / 402 * 100%)`,
                    width: `calc(115 / 402 * 100%)`, height: `calc(40 / 874 * 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ color: '#002738', fontSize: 'clamp(16px, 5vw, 20px)' ,fontWeight: '700' }}></span>
                    <input name="height" type="number" value={userInfo.height} onChange={handleChange} placeholder="167"
                           style={{ ...inputStyle, position: 'relative', }} />
                    <span style={{ color: '#002738'}}></span>
                </div>

                {/* 5. 몸무게 */}
                <div style={{ position: 'absolute', top: `calc(574 / 874 * 100%)`,left: `calc(214 / 402 * 100%)`, width: `calc(115 / 402 * 100%)`, height: `calc(40 / 874 * 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ color: '#002738', fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '700' }}></span>
                    <input name="weight" type="number" value={userInfo.weight} onChange={handleChange} placeholder="52"
                           style={{ ...inputStyle, position: 'relative' }} />
                    <span style={{ color: '#002738' }}></span>
                </div>

                {/* 6. 목표 */}
                <div style={{
                    position: 'absolute',top: `calc(710 / 874 * 100%)`,left: `calc(35/ 402 * 100%)`,
    
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    gap: `calc(25/ 402 * 100%)`, color: '#002738',
                   
                }}>
                    <span></span>
                    <input type="text" placeholder="00" value={userInfo.goalWeek}
                           onChange={(e) => setUserInfo({ ...userInfo, goalWeek: e.target.value })}
                           style={goalInputStyle} />
                    <span></span>
                    <input type="text" placeholder="0" value={userInfo.goalTime}
                           onChange={(e) => setUserInfo({ ...userInfo, goalTime: e.target.value })}
                           style={goalInputStyle} />
                    <span></span>
                    <input type="text" placeholder="000" value={userInfo.goalCal}
                           onChange={(e) => setUserInfo({ ...userInfo, goalCal: e.target.value })}
                           style={{ ...goalInputStyle}} />
                    <span></span>
                </div>

                {/* 에러 메시지 - top: 720/874 = 82.4% */}
                {error && (
                    <p style={{
                        position: 'absolute', left: '8%', top: `calc(750/ 874 * 100%)`,
                        color: '#e53e3e', fontSize: 'clamp(12px, 3.5vw, 14px)', margin: 0,
                    }}>
                        {error}
                    </p>
                )}

                {/* 7. 확인 버튼  */}
                <button onClick={handleConfirm} disabled={loading}
                        onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.97)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        style={{
                            position: 'absolute', left: `calc(50/402 * 100%)`, top: `calc(780/ 874 * 100%)`,
                             width: `calc(300 / 402 * 100vw)`,maxWidth: '300px', height:  `calc(57 / 874 * 100vw)`, maxheight:'57px',
                            backgroundColor: loading ? '#ccc' : '#1E59DA',
                            borderRadius: '9px', border: 'none',
                            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
                            color: '#ffffff', fontSize: `calc(20 / 874 * 100vw)`,
                            fontWeight: '500', fontFamily: 'inherit',
                            cursor: loading ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.1s ease-in-out',
                        }}>
                    {loading ? '저장 중...' : '시작하기'}
                </button>
            </div>
        </div>
    );
}

export default Page2;