import AiImage from '../assets/Components/AiCoach.svg';
import GhostImg from '../assets/Components/GhostBody.svg';
import Uploadimg from '../assets/Icon/UploadIcon.svg';

import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { requestAiCoaching } from '../api';

function AiUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "사용자";
  const [selectedFile, setSelectedFile] = useState(null);
  const [bodyDescription, setBodyDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await requestAiCoaching(bodyDescription, selectedFile);
      navigate('/Analyzing');
    } catch (e) {
      setError('AI 코칭 요청 중 오류가 발생했어요.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '402 / 974', backgroundColor: '#ffffff' }}>

      {/* 배경 이미지 */}
      <img src={AiImage} alt="background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* 파일 input */}
      <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* 안내 텍스트1 - top: 150/974=15.4% */}
      <p style={{
        position: 'absolute', top:`calc(175/874*100%)`, left:`calc(29/402*100%)` , right: '7%',
        color: '#002738',
        fontSize: '15px', margin: 0, zIndex: 1,
      }}>
        {name}님의 체형 사진과 체형 고민을 추가해 주세요
      </p>

      {/* 안내 텍스트2 - top: 180/974=18.5% */}
      <p style={{
        position: 'absolute',top:`calc(212/874*100%)`, left:`calc(29/402*100%)` , right: '7%',
        color: '#002738',
        fontSize: '15px', margin: 0, zIndex: 1,
        lineHeight: '1.5',
      }}>
        체형이 잘 드러나는 전신 사진을 업로드 하면<br />정확도가 올라가요!
      </p>

      <img src={GhostImg} alt="body-guide" 
             style={{ 
               position:'absolute',
               top:`calc(276/874*100%)`,
               left:`calc(37/402*100%)`,
               width: `calc(321/402*100%)`, 
               height:`calc(321/874*100%)`,
               zIndex:100
             }} 
        />

      {/* 업로드 버튼 - */}
      <button onClick={handleUpload} style={{
          position: 'absolute', 
          top: `calc(607 / 874 * 100%)`, 
          left: `calc(325 / 402 * 100%)`,
          width: '36px',  
          height: '36px',
          backgroundColor: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10,
      }} >
        <img 
      src={Uploadimg} 
      alt="upload" 
      style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain' 
      }} 
      />
      </button>

      {/* 파일 선택 표시 - top: 610/974=62.6% */}
      {selectedFile && (
        <p style={{
          position: 'absolute', top: '65%', left: '5%', right: '5%',
          fontSize: 'clamp(11px, 3.2vw, 13px)', color: '#002738',
          textAlign: 'center', margin: 0, zIndex: 1,
        }}>
          📷 {selectedFile.name}
        </p>
      )}

      {/* textarea - top: 650/974=66.7% */}
      <textarea
        placeholder={`${name}님의 체형 특징과 고민을 적어주세요`}
        value={bodyDescription}
        onChange={(e) => setBodyDescription(e.target.value)}
        style={{
          position: 'absolute',
          top:`calc(649/874*100%)`, left:`calc(40/402*100%)` ,
          width: '79.6%',    // 320/402
          height: '12.3%',   // 120/974
          backgroundColor: '#E9EAEF',
          borderRadius: '24px', border: 'none',
          padding: '16px',
          fontSize: 'clamp(12px, 3.7vw, 15px)',
          color: '#002738', fontFamily: 'inherit',
          resize: 'none', outline: 'none',
          boxSizing: 'border-box', zIndex: 1,
        }}
      />

      {/* 에러 메시지 - top: 740/974=76% */}
      {error && (
        <p style={{
          position: 'absolute', top: '88%', left: '10.2%',
          color: '#e53e3e', fontSize: 'clamp(12px, 3.5vw, 14px)',
          margin: 0, zIndex: 1,
        }}>
          {error}
        </p>
      )}

      {/* 제출 버튼 - top: 840/974=86.2% */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          position: 'absolute', top: '90.2%', left: '10%',
          width: '79.6%',
          height: '6.8%',    // 66/974
          backgroundColor: loading ? '#ccc' : '#1E59DA',
          borderRadius: '14px', border: 'none',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          color: '#FFFFFF', fontSize: '16px',
          fontWeight: '400', fontFamily: 'inherit',
          cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.1s ease-in-out', zIndex: 1,
        }}>
        {loading ? '분석 중...' : '내 체형 및 정보 업로드 하기'}
      </button>

    </div>
  );
}

export default AiUpload;