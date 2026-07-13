import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Backimg from '../assets/Icon/BackForward.svg';



const TABS = [
  { key: 'recent', label: '최신순', sort: (a, b) => b.createdAt - a.createdAt },
  { key: 'attendance', label: '출석순', sort: (a, b) => b.attendance - a.attendance },
  { key: 'members', label: '인원순', sort: (a, b) => b.memberCount - a.memberCount },
];

// GroupResponse(백엔드) → 화면에서 쓰는 형태로 변환
function toViewGroup(g) {
  return {
    id: g.id,
    name: g.name,
    type: g.category,
    people: `${g.memberCount}/${g.maxMembers ?? '∞'}`,
    goal: g.goal,
    desc: g.description,
    inviteCode: g.inviteCode,
    myRole: g.myRole,
    members: g.members ?? [],
  };
}

function parseMaxMembers(label) {
  if (!label || label === '제한 없음') return null;
  const n = parseInt(label, 10);
  return Number.isNaN(n) ? null : n;
}

// ── 옵션 데이터 (NewGroupSheet용) ────────────────────
const CATEGORIES = ['헬스', '러닝', '홈트레이닝', '필라테스', '요가', '자전거', '수영', '농구', '축구', '테니스', '배드민턴', '발레', '등산'];
const GOALS      = ['주 1회', '주 2회', '주 3회', '주 4회', '주 5회', '주 6회', '주 7회', '주 1시간', '주 2시간', '주 3시간', '주 4시간', '주 5시간', '주 6시간'];
const MEMBERS    = ['제한 없음', '2명', '3명', '4명', '5명', '6명', '7명', '8명', '9명', '10명', '11명', '12명', '13명'];

// ── 그룹 미리보기 팝업 ────────────────────────────────
function GroupPopup({ group, onClose, onExplore }) {
  const [showDetail, setShowDetail] = useState(false); 
  if (!group) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100, animation: 'fadeIn 0.2s ease' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderRadius: '24px 24px 0 0', zIndex: 101, paddingBottom: 32, animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>
        <div style={{ padding: '14px 20px 10px' }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
        </div>
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>종목 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.type}</span></span>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
          <span style={{ fontSize: 13, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
        </div>
        <div style={{ margin: '0 20px 16px' }}>
          <div onClick={() => setShowDetail(true)} style={{ backgroundColor: '#EBF0FF', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}> 
            <span style={{ fontSize: 14, fontWeight: '600', color: '#1E59DA' }}>그룹 소개/규칙</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#1E59DA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div style={{ padding: '0 20px 24px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>{group.desc}</p>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px 0', backgroundColor: '#F3F4F6', color: '#8B95A1', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: '700', cursor: 'pointer' }}>닫기</button>
          <button onClick={() => onExplore(group)} style={{ flex: 1, padding: '14px 0', backgroundColor: '#1E59DA', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: '700', cursor: 'pointer' }}>둘러보기</button>
        </div>
      </div>
      {showDetail && ( 
        <GroupDetailView
          groupName={group.name}
          category={group.type}
          members={group.people}
          goal={group.goal}
          desc={group.desc}
          onSave={() => {}}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

// ── 검색 모달 ─────────────────────────────────────────
function SearchModal({ onClose, onSelectGroup }) {
  const [query, setQuery] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const recommendedKeywords = ['하체', '다이어트', '헬스', '갓생', '하체', '다이어트'];
  const popularKeywords = ['대학생', '직장인', '오운완', '아침운동', '미라클모닝', '홈트'];

  const handleSearch = async (keyword) => {
    const searchTerm = (keyword || query).trim();
    if (!searchTerm) return;
    setQuery(searchTerm);
    setIsSubmitted(true);
    setSearching(true);
    try {
      const found = await exploreGroups(searchTerm);
      setResults((found ?? []).map(toViewGroup));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.18s ease' }}>
      <div style={{ padding: '60px 20px 0', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={Backimg} alt="back" style={{ width: '24px', height: '24px', opacity: 0.4 }} />
        </button>
      </div>
      <div style={{ marginTop: '48px', padding: '0 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: isSubmitted ? 'transparent' : '#FFFFFF', borderRadius: '16px', padding: isSubmitted ? '0' : '24px', boxShadow: isSubmitted ? 'none' : '0 5px 11.3px rgba(0,0,0,0.25)', transition: 'all 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', borderRadius: '100px', padding: '14px 16px', border: '1px solid #8E8E8E', height: '36px', boxSizing: 'border-box' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#8E8E8E" strokeWidth="2" />
              <path d="M21 21L16.65 16.65" stroke="#8E8E8E" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              autoFocus value={query}
              onChange={e => { setQuery(e.target.value); if (isSubmitted) setIsSubmitted(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="키워드를 검색하세요"
              style={{ flex: 1, border: 'none', background: 'none', fontSize: '12px', outline: 'none' }}
            />
          </div>
          {!isSubmitted && (
            <div style={{ marginTop: '30px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#000', marginBottom: '20px' }}>추천 키워드</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {recommendedKeywords.map((tag, i) => (
                  <button key={i} onClick={() => handleSearch(tag)} style={{ display: 'flex', width: '61px', height: '28px', flexDirection: 'column', justifyContent: 'center', flexShrink: 0, alignItems: 'center', backgroundColor: '#E9ECEF', border: 'none', borderRadius: '20px', padding: 0, fontSize: '12px', color: '#4E5968', cursor: 'pointer' }}>{tag}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: isSubmitted ? '24px' : '32px' }}>
          {isSubmitted ? (
            <div>
              <p style={{ fontSize: '14px', color: '#8B95A1', marginBottom: '16px', paddingLeft: '4px' }}>검색 결과 <span style={{ color: '#000', fontWeight: '700' }}>{results.length}</span></p>
              {results.length > 0 ? results.map(group => (
                <div key={group.id} onClick={() => { onClose(); onSelectGroup(group); }} style={{ backgroundColor: '#E1EDFF', borderRadius: '32px', padding: '30px 24px', marginBottom: '16px', cursor: 'pointer' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: '700', color: '#000' }}>{group.name}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4E5968' }}>
                    <span>종목 <b style={{ color: '#000' }}>{group.type}</b></span>
                    <span>인원 <b style={{ color: '#000' }}>{group.people}</b></span>
                    <span>목표 <b style={{ color: '#000' }}>{group.goal}</b></span>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#ADB5BD' }}>검색 결과가 없습니다.</div>
              )}
            </div>
          ) : (
            <div style={{ padding: '0 4px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#191F28', marginBottom: '16px' }}>인기 검색어</p>
              {popularKeywords.map((word, i) => (
                <div key={i} onClick={() => handleSearch(word)} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', cursor: 'pointer', borderBottom: '1px solid #E5E8EB' }}>
                  <span style={{ width: '28px', fontSize: '12px', fontWeight: '800', color: '#000' }}>{i + 1}</span>
                  <span style={{ fontSize: '12px', color: '#333D4B', fontWeight: '500' }}>{word}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 선택 모달 (NewGroupSheet용) ───────────────────────
function SelectModal({ title, options, selected, onSelect, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 500 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: 16, zIndex: 501, width: '72%', maxHeight: '60%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F4', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: '700', color: '#191F28' }}>{title}</p>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => { onSelect(opt); onClose(); }} style={{ width: '100%', background: 'none', border: 'none', borderBottom: i < options.length - 1 ? '1px solid #F8F9FA' : 'none', padding: '13px 20px', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: selected === opt ? '700' : '400', color: selected === opt ? '#1E59DA' : '#333D4B' }}>{opt}</button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 드롭다운 행 (NewGroupSheet용) ────────────────────
function DropdownRow({ value, placeholder, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', background: 'none', border: 'none', padding: '11px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E0EAF4', boxSizing: 'border-box' }}>
      <span style={{ fontSize: 14, fontWeight: value ? '500' : '400', color: value ? '#191F28' : '#B0B8C1' }}>{value || placeholder}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="#B0B8C1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
// ── 그룹 소개 상세 페이지 (전체 화면 모달 컴포넌트) ──────────────────
function GroupDetailView({ groupName, category, members, goal, desc, onSave, onClose }) {
  // 💡 true 일 땐 모임장(편집가능), false 일 땐 비소속(열람만 가능)
  const [isHost, setIsHost] = useState(true); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState(desc || '');

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 600, display: 'flex', flexDirection: 'column' }}>
      {/* 권한 테스트 바 (실제 연동 완료 후 제거하셔도 좋습니다) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 20px', backgroundColor: '#1E59DA', color: '#fff', fontSize: '11px' }}>
        <span>[테스트] 상단 스위치 :</span>
        <button onClick={() => { setIsHost(!isHost); setIsEditing(false); }} style={{ fontSize: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isHost ? '현재: 모임장' : '현재: 비소속 일반유저'}
        </button>
      </div>

      {/* 헤더 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', height: '56px', padding: '0 20px', position: 'relative' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={Backimg} alt="back" style={{ width: '24px', height: '24px' }} />
        </button>
        <p style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', margin: 0, fontSize: '16px', fontWeight: '700', color: '#000' }}>
          {groupName || '하체 집중 모임'}
        </p>
      </div>

      {/* 인포 라인 (종목, 인원, 목표) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E8EB', padding: '16px 20px', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>종목 <b style={{ color: '#333D4B' }}>{category || '헬스'}</b></span>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>인원 <b style={{ color: '#333D4B' }}>{members || '3/8 명'}</b></span>
        <span style={{ fontSize: '14px', color: '#8B95A1' }}>목표 <b style={{ color: '#333D4B' }}>{goal || '주 2회'}</b></span>
      </div>

      {/* 본문 영역 */}
      <div style={{ flex: 1, padding: '24px 20px', position: 'relative' }}>
        <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#000' }}>그룹 소개/규칙</p>
        
        {isEditing ? (
          <textarea 
            value={tempDesc} 
            onChange={e => setTempDesc(e.target.value)} 
            style={{ width: '100%', height: '160px', border: '1px solid #1E59DA', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#000', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} 
          />
        ) : (
          <p style={{ margin: 0, fontSize: '14px', color: '#4E5968', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {tempDesc || '내용이 없습니다.'}
          </p>
        )}

        {/* 모임장일 때만 편집/저장하기 플로팅 버튼을 노출니다 */}
        {isHost && (
          <button 
            onClick={() => {
              if (isEditing) onSave(tempDesc);
              setIsEditing(!isEditing);
            }} 
            style={{ position: 'absolute', right: '20px', bottom: '40px', padding: '12px 24px', backgroundColor: '#E9EAEF', color: '#535252', border: 'none', borderRadius: '100px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',}}
          >
            {isEditing ? '저장하기' : '편집하기'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 운동 모임 만들기 하단 시트 ────────────────────────
function NewGroupSheet({ onClose }) {
  const [groupName, setGroupName] = useState('');
  const [category,  setCategory]  = useState('');
  const [goal,      setGoal]      = useState('');
  const [members,   setMembers]   = useState('');
  const [desc,      setDesc]      = useState('');
  const [openModal, setOpenModal] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const canSubmit = groupName.trim() && category && goal && members;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowSuccessPopup(true);
  };
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        onClose(); 
      }, 1000);

      return () => clearTimeout(timer); 
    }
  }, [showSuccessPopup, onClose]);

  return (
    <>
      {/* 딤 */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 300 }} />

      {/* 시트 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#F3F4F4', borderRadius: '24px 24px 0 0', zIndex: 301, maxHeight: '90%', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>

        {/* 시트 헤더 */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0, borderBottom: '1px solid #EBEBEB' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: '700', color: '#333D4B' }}>운동 모임 만들기</h2>
          <button onClick={onClose} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

            {/* 그룹명 */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>그룹명</p>
              <div style={{ border: '1px solid #E5E8EB', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', backgroundColor: '#DBE9F9' }}>
                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="그룹명을 적어주세요." style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: '#DBE9F9', fontSize: 14, color: '#191F28' }} />
              </div>
            </div>

            {/* 세부사항 */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>세부사항</p>
              <div style={{ border: '1px solid #E5E8EB', borderRadius: 10, overflow: 'hidden', backgroundColor: '#DBE9F9' }}>
                <DropdownRow placeholder="카테고리"      value={category} onClick={() => setOpenModal('category')} />
                <DropdownRow placeholder="한 주 목표 횟수" value={goal}     onClick={() => setOpenModal('goal')} />
                <DropdownRow placeholder="모집인원"      value={members}  onClick={() => setOpenModal('members')} />
              </div>
            </div>

            {/* 그룹 소개/규칙 */}
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>그룹 소개/규칙</p>
              <div 
                onClick={() => setShowDetail(true)}
                style={{ width: '100%', border: '1px solid #E5E8EB', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#191F28', backgroundColor: '#DBE9F9', minHeight: '96px', boxSizing: 'border-box', lineHeight: 1.6, cursor: 'pointer', whiteSpace: 'pre-wrap' }}
              >
                {desc || '어떤 그룹인가요? 소개를 적어주세요.'}
              </div>
            </div>
            
          </div>
          

          {/* 생성하기 버튼 */}
          <button onClick={handleSubmit} style={{ width: '100%', marginTop: 14, padding: '15px 0', backgroundColor: canSubmit ? '#1E59DA' : '#B0BEC5', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: '700', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}>
            생성하기
          </button>
          
        </div>
        
        {/* ── 모임 생성 완료 커스텀 팝업 모달 ── */}
      {showSuccessPopup && (
        <>
          {/* 어두운 배경(딤) */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              zIndex: 999,
            }} 
          />
          
          {/* 팝업 카드 컨테이너 (버튼 제거) */}
          <div style={{
            position: 'absolute',
            top: '90%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'calc(100% - 40px)', 
            height:'71px',
            maxWidth: '362px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(219, 233, 249, 0.84)',

            animation: 'popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              display: 'flex',
              width: '100%',     
              maxWidth: '386px',                
              minHeight: '71px',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#1E59DA',
              textAlign: 'center',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
            }}>
              모임이 생성되었습니다!
            </div>
          </div>
        </>
      )}
      {showDetail && (
        <GroupDetailView
          groupName={groupName}
          category={category}
          members={members}
          goal={goal}
          desc={desc}
          onSave={(newDesc) => setDesc(newDesc)}
          onClose={() => setShowDetail(false)}
        />
      )}
      
      </div>

      {/* 선택 모달 */}
      {openModal === 'category' && <SelectModal title="카테고리 선택" options={CATEGORIES} selected={category} onSelect={setCategory} onClose={() => setOpenModal(null)} />}
      {openModal === 'goal'     && <SelectModal title="목표 선택"     options={GOALS}      selected={goal}     onSelect={setGoal}     onClose={() => setOpenModal(null)} />}
      {openModal === 'members'  && <SelectModal title="모집 인원"     options={MEMBERS}    selected={members}  onSelect={setMembers}  onClose={() => setOpenModal(null)} />}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

// ── 그룹 카드 ─────────────────────────────────────────
function GroupCard({ group, onClick }) {
  return (
    <button onClick={() => onClick(group)} style={{ width: '100%', background: '#fff', border: 'none', borderRadius: 16, padding: '16px 20px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>{group.name}</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>종목 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.type}</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>인원 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.people}명</span></span>
        <span style={{ fontSize: 12, color: '#8B95A1' }}>목표 <span style={{ color: '#333D4B', fontWeight: '600' }}>{group.goal}</span></span>
      </div>
    </button>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function AddGroup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recent');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentTab = TABS.find(t => t.key === activeTab);

  const loadGroups = () => {
    setLoading(true);
    setError(null);
    exploreGroups(null, currentTab.sort)
      .then(list => setGroups((list ?? []).map(toViewGroup)))
      .catch(e => setError(e.message || '모임 목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  const handleExplore = (group) => {
    setSelectedGroup(null);
    navigate('/GroupExplore', { state: { group } });
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F4', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{ padding: '0 20px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', height: '60px', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B' }}>운동 모임 찾기</h1>
        <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#333D4B" strokeWidth="1.8" /><path d="M13.5 13.5L17 17" stroke="#333D4B" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* 탭 */}
      <div style={{ backgroundColor: '#fff', display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab.key ? '700' : '500', color: activeTab === tab.key ? '#1E59DA' : '#8B95A1', borderBottom: activeTab === tab.key ? '2px solid #1E59DA' : '2px solid transparent' }}>{tab.label}</button>
        ))}
      </div>

      {/* 카드 목록 */}
      <div style={{ padding: '16px 20px 100px', flex: 1, overflowY: 'auto' }}>
        {sorted.map(group => <GroupCard key={group.id} group={group} onClick={setSelectedGroup} />)}
      </div>

      {/* FAB */}
      <div style={{ position: 'absolute', right: 20, bottom: '5%', zIndex: 99 }}>
        <button
          onClick={() => setNewGroupOpen(true)}
          style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#1E59DA', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(30,89,218,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onSelectGroup={setSelectedGroup} />}
      <GroupPopup group={selectedGroup} onClose={() => setSelectedGroup(null)} onExplore={handleExplore} />
      {newGroupOpen && <NewGroupSheet onClose={() => setNewGroupOpen(false)} />}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}