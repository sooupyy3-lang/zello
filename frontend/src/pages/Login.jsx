import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getKakaoLoginUrl } from '../api';

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId) { setError('유저 ID를 입력해주세요'); return; }
    setLoading(true);
    setError('');
    try {
      await login(userId);
      navigate('/Page3');
    } catch (e) {
      setError('로그인에 실패했어요. ID를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/kakao/callback`;
      const { url } = await getKakaoLoginUrl(redirectUri);
      window.location.href = url;
    } catch (e) {
      setError('카카오 로그인을 시작할 수 없어요.');
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F3F4F4', padding: '40px 32px',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#002738', marginBottom: '8px' }}>
        로그인
      </h1>
      <p style={{ fontSize: '14px', color: '#8EB3C2', marginBottom: '40px' }}>
        처음이신가요? 시작 화면에서 가입해주세요
      </p>
      <input
        type="number"
        placeholder="유저 ID 입력"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        style={{
          width: '100%', height: '56px',
          border: '1.5px solid #BFE8F8', borderRadius: '12px',
          fontSize: '18px', textAlign: 'center', outline: 'none',
          color: '#002738', marginBottom: '12px', fontFamily: 'inherit',
        }}
      />
      {error && <p style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading} style={{
        width: '100%', height: '56px', borderRadius: '12px', border: 'none',
        backgroundColor: loading ? '#ccc' : '#BFE8F8', color: '#002738',
        fontSize: '18px', fontWeight: '700', cursor: loading ? 'default' : 'pointer',
        fontFamily: 'inherit',
      }}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
      <button onClick={handleKakaoLogin} style={{
        width: '100%', height: '56px', borderRadius: '12px', border: 'none',
        backgroundColor: '#FEE500', color: '#191919',
        fontSize: '18px', fontWeight: '700', cursor: 'pointer',
        fontFamily: 'inherit', marginTop: '12px',
      }}>
        카카오로 로그인
      </button>
      <button onClick={() => navigate('/Page2')} style={{
        marginTop: '16px', background: 'none', border: 'none',
        color: '#8EB3C2', fontSize: '14px', cursor: 'pointer',
        fontFamily: 'inherit', textDecoration: 'underline',
      }}>
        회원가입 하러 가기
      </button>
    </div>
  );
}

export default Login;
