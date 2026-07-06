import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserName } from '../api';
import { HamburgerButton, HamburgerPanel } from '../pages/HamburgerMenu';

function AiCoach() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const name = getUserName() || "사용자";

    // 버튼 공통 스타일
    const buttonContainerStyle = {
        width: '100%',
        maxWidth: '343px', 
        backgroundColor: '#1E59DA',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '16px',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(30, 89, 218, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'transform 0.1s ease'
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: '800',
        color: '#FFFFFF',
        margin: 0
    };

    const subTitleStyle = {
        fontSize: '14px',
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        margin: 0
    };

    return (
        <div style={{ 
            width: '100%', 
            maxWidth: '450px',
            margin: '0 auto',
            height: '100%', 
            backgroundColor: '#F3F4F4', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* ── 1. 상단 헤더 ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '80px 20px 20px',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <HamburgerButton onOpen={() => setMenuOpen(true)} />
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#333D4B', margin: 0 }}>
                    AI 운동 코칭
                </h1>
            </div>

            {/* ── 2. 버튼 영역 ── */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '40px 20px 0' ,
                marginTop: '30px'
            }}>
                
                {/* 첫 번째 버튼: 운동 데이터 기반 */}
                <button 
                    style={buttonContainerStyle}
                    onClick={() => navigate('/AiResultEx')} 
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <p style={titleStyle}>운동 데이터 기반 AI 코칭</p>
                    <p style={subTitleStyle}>운동 데이터 기반 AI 코칭 받고 나만의 루틴 짜기</p>
                </button>

                {/* 두 번째 버튼: 체형 기반 */}
                <button 
                    style={buttonContainerStyle}
                    onClick={() => navigate('/AiUpload')} 
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <p style={titleStyle}>체형 기반 AI 코칭</p>
                    <p style={subTitleStyle}>체형 기반 AI 코칭 받고 나만의 루틴 짜기</p>
                </button>
            </div>

            {/* ── 3. 사이드 메뉴 패널 ── */}
            {menuOpen && (
                <HamburgerPanel userName={name} onClose={() => setMenuOpen(false)} />
            )}
        </div>
    );
}

export default AiCoach;