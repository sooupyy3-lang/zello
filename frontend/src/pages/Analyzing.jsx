import GhostRunning from '../assets/Components/GhostRunning.png';
import AiImage from '../assets/Components/AiCoach.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react'


function Analyzing(){
    const navigate = useNavigate();
    const location = useLocation();
    
    
    const name = location.state?.name || "사용자";
    useEffect(() => {
            const timer = setTimeout(() => {
          navigate('/AiResult')
        }, 4000)
        return () => clearTimeout(timer)
      })
    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            backgroundColor: '#fff', 
            boxSizing: 'border-box',
            alignItems:'center'
        }}>
            
            {/* 배경 이미지 */}
           <img
    src={AiImage}
    alt="background"
    style={{
        position: 'absolute',
        top: '-10px',
        left: 0,
        width: '100%',
        zIndex: 0,
    }}/>

           
                
    {/* 캐릭터 이미지 배치 */}

                <div style={{
                    position: 'absolute',
                    width: '300px', 
                    height: '300px', 
                    top: '239px', 
                    left:'51px',
                    marginBottom: '62px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex:1
                }}>
                    <img
                        src={GhostRunning}
                        alt="character"
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    />
                </div>

                {/* 텍스트 배치 */}
                <div style={{ 
    position: 'absolute',
    top: '601px',
    left: '0',
    right: '0',      
    width: '402px',  
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    zIndex: 1, 
}}>
                    <p style={{ 
                        fontSize: '24px', 
                        fontWeight: '800', 
                        color: '#002738', 
                        margin: '0 auto',
                        padding:0,
                        width:'100%',
                        textAlign: 'center', 
                        lineHeight: '1.1',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word' 
                    }}>
                         {name}님의 체형 사진과 정보를<br/> 
                        분석하고 있어요
                        
                    </p>
                </div>
            
            
        </div>
    );
}

export default Analyzing;