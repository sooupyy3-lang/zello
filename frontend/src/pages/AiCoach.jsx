import GhostRunning from '../assets/Components/GhostRunning.png';
import AiImage from '../assets/Components/AiCoach.svg';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'
import { getUserName } from '../api';


function AiCoach(){
    const navigate = useNavigate();
    const name = getUserName() || "사용자";
    useEffect(() => {
            const timer = setTimeout(() => {
          navigate('/AiUpload', { state: { name } })
        }, 4000)
        return () => clearTimeout(timer)
      })
    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            backgroundColor: '#fff', // 배경 이미지가 로딩되기 전 표시될 색상
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
                        안녕하세요<br/> {name}님의 체형 정보를 기반으로<br/> 
                        AI 운동 코칭을 해드릴게요
                    </p>
                </div>
            
            
        </div>
    );
}

export default AiCoach;