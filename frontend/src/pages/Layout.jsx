import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '../assets/Icon/HomeIcon.png';
import CalendarIcon from '../assets/Icon/CalendarIcon.png';
import AiIcon from '../assets/Icon/AiIcon.png';
import MypageIcon from '../assets/Icon/MypageIcon.png';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const navItems = [
    {  icon: HomeIcon, path: '/Page3', label: '홈' },
    { icon: CalendarIcon, path: '/Calendar', label: '캘린더' },
    {  icon: AiIcon, path: '/AiCoach', label: 'AI코치'},
    {  icon: MypageIcon, path: '/MyPage',label: '마이페이지' },
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      margin: '0 auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 1. 페이지 콘텐츠가 나오는 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        <Outlet /> 
      </div>

      {/* 2. 공통 하단 네비게이션 바 */}
      <div style={{
        flexShrink: 0,
        height: '75px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: '15px',
        zIndex: 100
      }}>
        {navItems.map((item, idx) => {
          // 현재 경로와 일치하면 active 표시
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={idx} 
              onClick={() => navigate(item.path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                
              }}
            >
              <img src={item.icon} alt={item.label} style={{ width: '28px', height: '28px', objectFit: 'contain', filter: isActive 
        ? 'brightness(0) saturate(100%) invert(35%) sepia(80%) saturate(500%) hue-rotate(163deg) brightness(90%)'
        : 'brightness(0) saturate(100%) invert(14%) sepia(29%) saturate(1200%) hue-rotate(163deg) brightness(94%) contrast(97%)'  
    }}  />
              
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Layout;