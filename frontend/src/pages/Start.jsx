import { useNavigate } from 'react-router-dom';
import OnButton from '../assets/Components/OnButton.svg';
import myImage from '../assets/Components/Start.svg';

function Start() {
  const navigate = useNavigate();

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
        onClick={() => navigate('/Page2')}
        style={{
          position: 'absolute',
          left: '31.3%', top: '80.9%',
          padding: 0, background: 'none', border: 'none', cursor: 'pointer', zIndex: 1,
        }}
      >
        <img src={OnButton} alt="다음으로 이동" style={{ width: 'clamp(120px, 37vw, 150px)' }} />
      </button>
    </div>
  );
}

export default Start;