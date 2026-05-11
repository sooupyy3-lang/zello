import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
import { getExercises, startSession } from '../api';

function Page4({ setSelectedExercise }) {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedSubs, setSelectedSubs] = useState([]); // ⭐ 다중 선택을 위한 배열 처리
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const EXERCISE_DATA = {
    running: { label: '러닝', category: '러닝', items: [{ name: '걷기' }, { name: '달리기' }] },
    health: { label: '헬스', category: '헬스', items: [{ name: '상체' }, { name: '하체' }, { name: '코어' }, { name: '유산소' }] },
    home: { label: '홈트', category: '홈트', items: [{ name: '전신' }, { name: '상체' }, { name: '하체' }, { name: '코어' }] },
    yoga: { label: '요가', category: '요가', items: [{ name: '스트레칭' }, { name: '밸런스' }, { name: '유연성' }] },
    pilates: { label: '필라테스', category: '필라테스', items: [{ name: '코어' }, { name: '전신' }] },
    cardio: { label: '유산소', category: '유산소', items: [{ name: '자전거' }, { name: '줄넘기' }, { name: '계단' }] },
    sports: { label: '스포츠', category: '스포츠', items: [{ name: '구기' }, { name: '라켓' }] },
    swimming: { label: '수영', category: '수영', items: [{ name: '전신' }] },
    etc: { label: '기타', category: '기타', items: [{ name: '기타' }] }
  };

  useEffect(() => {
    getExercises().then(setExerciseTypes).catch(() => {});
  }, []);

  // ⭐ 다중 선택 토글 함수
  const toggleSelect = (item, key, label) => {
    const isAlreadySelected = selectedSubs.find(s => s.name === item.name && s.parent === key);
    
    if (isAlreadySelected) {
      // 이미 선택되어 있으면 제거
      setSelectedSubs(selectedSubs.filter(s => !(s.name === item.name && s.parent === key)));
    } else {
      // 없으면 추가
      setSelectedSubs([...selectedSubs, { ...item, parent: key, categoryLabel: label }]);
    }
  };

  const handleStart = async () => {
    if (selectedSubs.length === 0) return;

    setLoading(true);
    try {
      // 선택된 모든 항목의 이름과 매칭되는 백엔드 ID들 추출
      const ids = selectedSubs
        .map(sub => exerciseTypes.find(et => et.name === sub.name)?.id)
        .filter(id => id !== undefined);

      let sessionData = null;
      if (ids.length > 0) {
        sessionData = await startSession(ids); // 여러 개의 ID 배열 전송
      }

      setSelectedExercise({
        items: selectedSubs.map(s => s.name),
        categories: [...new Set(selectedSubs.map(s => s.categoryLabel))], // 중복 제거된 카테고리 목록
        sessionData,
      });
      
      navigate('/Page8');
    } catch (e) {
      console.error('startSession 실패:', e.message);
      setSelectedExercise({ items: selectedSubs.map(s => s.name) });
      navigate('/Page8');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <img src={BackForward} alt="뒤로" style={styles.backIcon} />
        </button>
        <h2 style={styles.title}>운동 선택하기</h2>
      </div>

      <div style={styles.grid}>
        {Object.entries(EXERCISE_DATA).map(([key, ue]) => {
          const isOpen = openCategory === key;
          const isFullWidth = key === 'etc';
          // 해당 카테고리에 하나라도 선택된 게 있는지 확인
          const hasSelectedInThisCategory = selectedSubs.some(s => s.parent === key);

          return (
            <div key={key} style={{ gridColumn: isFullWidth ? '1 / -1' : 'auto', position: 'relative' }}>
              <div 
                onClick={() => {
                  if (key === 'etc') {
                    toggleSelect(ue.items[0], key, ue.label);
                  } else {
                    setOpenCategory(isOpen ? null : key);
                  }
                }}
                style={{
                  ...styles.categoryCard,
                  backgroundColor: isOpen || hasSelectedInThisCategory ? '#E0E0E0' : '#FFF',
                  borderColor: hasSelectedInThisCategory ? '#1E59DA' : '#E2E8F0',
                  boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                }}
              >
                <span style={styles.categoryLabel}>{ue.label}</span>
                {key !== 'etc' && (
                  <div style={styles.arrowBtn}>
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }}>▼</span>
                  </div>
                )}
              </div>

              {key !== 'etc' && isOpen && (
                <div style={styles.dropdown}>
                  {ue.items.map((item, idx) => {
                    const isItemSelected = selectedSubs.some(s => s.name === item.name && s.parent === key);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleSelect(item, key, ue.label)}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: isItemSelected ? '#E9EAEF' : 'transparent',
                        }}
                      >
                        <span style={{ 
                          fontSize: '14px', 
                          color: isItemSelected ? '#1E59DA' : '#535252', 
                          fontWeight: isItemSelected ? '700' : '500' 
                        }}>
                          {item.name}
                        </span>
                        {isItemSelected && <span style={{ color: '#1E59DA', fontSize: '12px' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button 
          onClick={handleStart}
          disabled={selectedSubs.length === 0 || loading}
          style={{
            ...styles.startBtn,
            backgroundColor: selectedSubs.length > 0 && !loading ? '#1E59DA' : '#E2E8F0',
            color: selectedSubs.length > 0 && !loading ? '#FFF' : '#8E8E8E'
          }}
        >
          {loading ? '시작 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { width: '100%', minHeight: '100vh', backgroundColor: '#FFF', padding: '20px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '30px', position: 'relative', paddingTop: '40px' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  backIcon: { width: '10px' },
  title: { flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '500', marginRight: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  categoryCard: {
    height: '100px', borderRadius: '12px', border: '1px solid #E2E8F0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', transition: 'all 0.2s', cursor: 'pointer'
  },
  categoryLabel: { fontSize: '20px', fontWeight: '500', color: '#002738' },
  arrowBtn: { background: 'none', border: 'none', color: '#8E8E8E', fontSize: '12px' },
  dropdown: {
    position: 'absolute', top: '105px', left: 0, width: '100%',
    backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0'
  },
  dropdownItem: { 
    padding: '12px 16px', fontSize: '14px', cursor: 'pointer', 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
  },
  footer: { marginTop: '40px', paddingBottom: '40px' },
  startBtn: {
    width: '100%', height: '60px', borderRadius: '16px', border: 'none',
    fontSize: '18px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(30, 89, 218, 0.2)'
  }
};

export default Page4;