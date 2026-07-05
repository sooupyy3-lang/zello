import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kakaoLogin } from '../api';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) { navigate('/Login'); return; }

    const redirectUri = `${window.location.origin}/kakao/callback`;

    kakaoLogin(code, redirectUri)
      .then(data => {
        if (data.isNewUser) {
          navigate('/Page2', { state: { kakaoId: data.kakaoId, name: data.name } });
        } else {
          navigate('/Page3');
        }
      })
      .catch(() => navigate('/Login'));
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', backgroundColor: '#F3F4F4',
    }}>
      <p style={{ fontSize: '16px', color: '#002738' }}>카카오 로그인 처리 중...</p>
    </div>
  );
}

export default KakaoCallback;
