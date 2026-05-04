import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackForward from '../assets/Icon/BackForward.svg';
import { getExercises, startSession } from '../api';

function Page4({ setSelectedExercise }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 카테고리 → exercises 맵 (백엔드 category 필드 기준)
  const categories = [
    { id: 'running',  label: '러닝',     sub: '걷기/달리기',           category: '러닝' },
    { id: 'health',   label: '헬스',     sub: '상체/하체/코어/유산소', category: '헬스' },
    { id: 'home',     label: '홈트',     sub: '전신/상체/하체/코어',   category: '홈트' },
    { id: 'yoga',     label: '요가',     sub: '스트레칭/밸런스/유연성',category: '요가' },
    { id: 'pilates',  label: '필라테스', sub: '코어/전신',             category: '필라테스' },
    { id: 'cardio',   label: '유산소',   sub: '자전거/줄넘기/계단',    category: '유산소' },
    { id: 'sports',   label: '스포츠',   sub: '구기/라켓',             category: '스포츠' },
    { id: 'swimming', label: '수영',     sub: '',                      category: '수영' },
    { id: 'etc',      label: '기타',     sub: '',                      category: '기타' },
  ];

  useEffect(() => {
    getExercises().then(setExerciseTypes).catch(() => {});
  }, []);

  const handleStart = async () => {
    if (!selected) return;
    const found = categories.find((c) => c.id === selected);

    // 선택한 카테고리에 속하는 운동 타입 IDs
    const ids = exerciseTypes
      .filter((et) => et.category === found.category)
      .map((et) => et.id);

    setLoading(true);
    try {
      let sessionData = null;
      if (ids.length > 0) {
        sessionData = await startSession(ids);
      }
      // 로컬 UI용 selectedExercise 세팅
      const localItems = exerciseTypes
        .filter((et) => et.category === found.category)
        .map((et) => et.name);
      setSelectedExercise({
        ...found,
        items: localItems.length > 0 ? localItems : ['기타'],
        sessionData, // 세션 응답 포함
      });
      navigate('/Page8');
    } catch (e) {
      console.error('startSession 실패:', e.message);
      setSelectedExercise(found);
      navigate('/Page8');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100dvh',backgroundSize: 'cover',backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',  position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', zIndex: 0,
      }} />

      <div style={{ position: 'sticky', top: `calc(57/874*100vw)`,  display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={BackForward} alt="이전" style={{ width: `calc(8/402*100vw)`, height: `calc(16/874*100vw)`,objectFit: 'contain',BackgroundColor:'#1E1E1E' }} />
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '-60px' }}>
        <div style={{ paddingTop: '100px', textAlign: 'center', marginBottom: '0px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#002738' }}>운동 선택하기</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 3vw, 14px)', padding: 'clamp(20px, 5vw, 29px) clamp(16px, 5vw, 20px) 30px',  }}>
          {categories.map((ex) => {
            const isSelected = selected === ex.id;
            const isFullWidth = ex.id === 'etc';
            return (
              <button key={ex.id}
                onClick={() => setSelected((prev) => (prev === ex.id ? null : ex.id))}
                style={{
                  gridColumn: isFullWidth ? '1 / -1' : 'auto',
                  height: 'clamp(90px, 22vw, 110px)', borderRadius: '9px',
                  border: isSelected ? '2px solid #E9EAEF' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#E9EAEF' : '#ffffff',
                  boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <span style={{ fontSize: 'clamp(11px, 3.5vw, 20px)',  fontWeight: '800', color: '#002738' }}>{ex.label}</span>
                {ex.sub && <span style={{ fontSize: '14px', fontWeight: '500', color: '#002738' }}>{ex.sub}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '20px 20px 100px' }}>
          <button onClick={handleStart} disabled={!selected || loading}
            style={{
              width: '100%',height: 'clamp(54px, 13vw, 66px)',  borderRadius: '20px', border: 'none',
              backgroundColor: selected && !loading ? '#1E59DA' : '#e2e8f0',
              color:selected && !loading ?  '#ffffff':'#002738', fontSize: 'clamp(18px, 5.5vw, 22px)', fontWeight: '700',
              boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
              cursor: selected && !loading ? 'pointer' : 'default',
            }}>
            {loading ? '시작 중...' : '시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page4;
