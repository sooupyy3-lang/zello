import BodyImage from '../assets/Components/Upload.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { requestAiCoaching } from '../api';

function AiUpload() {
  const navigate = useNavigate();
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
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#F3F4F4' }}>
      <img src={BodyImage} alt="background" style={{ width: '100%', display: 'block', zIndex: 0 }} />


      {/* 파일 input */}
      <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* 업로드 버튼 */}
      <button onClick={handleUpload} style={{
        position: 'absolute', top: '550px', left: '337px',
        width: '50px', height: '50px', background: 'transparent', border: 'none', cursor: 'pointer',
      }} />

      {/* 파일 선택 표시 */}
      {selectedFile && (
        <p style={{ position: 'absolute', top: '610px', left: '20px', right: '20px', fontSize: '13px', color: '#002738', textAlign: 'center', margin: 0 }}>
          📷 {selectedFile.name}
        </p>
      )}

      {/* 체형 설명 입력 */}
      <textarea
        placeholder="체형 고민이나 특이사항을 입력해주세요 (선택)"
        value={bodyDescription}
        onChange={(e) => setBodyDescription(e.target.value)}
        style={{
          position: 'absolute', top: '650px', left: '33px', right: '33px',
          width: 'calc(100% - 66px)', height: '80px',
          border: '1px solid #BFE8F8', borderRadius: '9px', padding: '10px',
          fontSize: '14px', fontFamily: 'inherit', color: '#002738',
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />

      {error && (
        <p style={{ position: 'absolute', top: '740px', left: '33px', color: '#e53e3e', fontSize: '14px', margin: 0 }}>{error}</p>
      )}

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          position: 'absolute', left: '33px', top: '840px',
          width: '320px', height: '66px',
          backgroundColor: loading ? '#ccc' : '#BFE8F8',
          borderRadius: '9px', border: 'none',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          color: '#002738', fontSize: '24px', fontWeight: '800',
          fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.1s ease-in-out',
        }}>
        {loading ? '분석 중...' : '제출하기'}
      </button>
    </div>
  );
}

export default AiUpload;
