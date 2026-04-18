import BodyImage from '../assets/Components/Upload.svg';
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '402 / 974', backgroundColor: '#F3F4F4' }}>

      {/* 배경 이미지 */}
      <img src={BodyImage} alt="background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* 파일 input */}
      <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* 안내 텍스트1 - top: 150/974=15.4% */}
      <p style={{
        position: 'absolute', top: '17.4%', left: '7%', right: '7%',
        textAlign: 'center', color: '#002738',
        fontSize: 'clamp(13px, 4vw, 16px)', margin: 0, zIndex: 1,
      }}>
        {name}님의 체형 사진과 체형 고민을 추가해 주세요
      </p>

      {/* 안내 텍스트2 - top: 180/974=18.5% */}
      <p style={{
        position: 'absolute', top: '20.5%', left: '7%', right: '7%',
        textAlign: 'center', color: '#002738',
        fontSize: 'clamp(13px, 4vw, 16px)', margin: 0, zIndex: 1,
        lineHeight: '1.5',
      }}>
        체형이 잘 드러나는 전신 사진을 업로드 하면<br />정확도가 올라가요!
      </p>

      {/* 업로드 버튼 - top: 575/974=59%, left: 337/402=83.8% */}
      <button onClick={handleUpload} style={{
        position: 'absolute', top: '64%', left: '83.8%',
        width: 'clamp(40px, 12vw, 50px)', height: 'clamp(40px, 12vw, 50px)',
        background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 1,
      }} />

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
          top: '69%', left: '10.2%',
          width: '79.6%',    // 320/402
          height: '12.3%',   // 120/974
          backgroundColor: '#BFE8F8',
          borderRadius: '9px', border: 'none',
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
          backgroundColor: loading ? '#ccc' : '#BFE8F8',
          borderRadius: '9px', border: 'none',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          color: '#002738', fontSize: 'clamp(18px, 6vw, 24px)',
          fontWeight: '800', fontFamily: 'inherit',
          cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.1s ease-in-out', zIndex: 1,
        }}>
        {loading ? '분석 중...' : '제출하기'}
      </button>

    </div>
  );
}

export default AiUpload;