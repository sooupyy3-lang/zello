import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnButton from '../assets/Components/OnButton.svg';
import myImage from '../assets/Components/Start.svg';
import { getKakaoLoginUrl } from '../api';

function Start() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

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
      position: 'relative',
      width: '100%',
      aspectRatio: '402 / 874',
    }}>
      <img src={myImage} alt="background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 0 }} />

      {/* 버튼 */}
      <button
        onClick={handleKakaoLogin}
        style={{
          position: 'absolute',
          left: '12.5%', top: '80.9%',
          padding: 0, background: 'none', border: 'none', cursor: 'pointer', zIndex: 1,
        }}
      >
        <img src={OnButton} alt="카카오로 시작하기" style={{ width: `calc(300 / 402 * 100vw)`,
    maxWidth: '300px'}} />
      </button>

      {error && (
        <p style={{
          position: 'absolute', left: 0, right: 0, top: '92%',
          textAlign: 'center', margin: 0, fontSize: 13, color: '#e53e3e', zIndex: 1,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Start;