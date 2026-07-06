import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 더미 옵션 데이터 ──────────────────────────────────
const CATEGORIES = ['헬스', '러닝', '홈트레이닝', '필라테스', '요가', '자전거', '수영', '농구', '축구', '테니스', '배드민턴', '발레', '등산'];
const GOALS      = ['주 1회', '주 2회', '주 3회', '주 4회', '주 5회', '주 6회', '주 7회', '주 1시간', '주 2시간', '주 3시간', '주 4시간', '주 5시간', '주 6시간'];
const MEMBERS    = ['제한 없음', '2명', '3명', '4명', '5명', '6명', '7명', '8명', '9명', '10명', '11명', '12명', '13명'];

// ── 선택 모달 ─────────────────────────────────────────
function SelectModal({ title, options, selected, onSelect, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 200 }}
      />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 16,
        zIndex: 201, width: '72%',
        maxHeight: '65%', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
      }}>
        {/* 타이틀 */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F4', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: '700', color: '#191F28' }}>{title}</p>
        </div>

        {/* 옵션 리스트 */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {options.map((opt, i) => {
            const isSelected = selected === opt;
            return (
              <button
                key={i}
                onClick={() => { onSelect(opt); onClose(); }}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  borderBottom: i < options.length - 1 ? '1px solid #F8F9FA' : 'none',
                  padding: '13px 20px', cursor: 'pointer', textAlign: 'left',
                  fontSize: 14, fontWeight: isSelected ? '700' : '400',
                  color: isSelected ? '#1E59DA' : '#333D4B',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── 드롭다운 행 ───────────────────────────────────────
function DropdownRow({ label, value, placeholder, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'none', border: 'none',
        padding: '11px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F0F1F3', boxSizing: 'border-box',
      }}
    >
      <span style={{
        fontSize: 14,
        fontWeight: value ? '500' : '400',
        color: value ? '#191F28' : '#B0B8C1',
      }}>
        {value || placeholder}
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="#B0B8C1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function NewGroup() {
  const navigate = useNavigate();

  const [groupName, setGroupName]   = useState('');
  const [category,  setCategory]    = useState('');
  const [goal,      setGoal]        = useState('');
  const [members,   setMembers]     = useState('');
  const [desc,      setDesc]        = useState('');

  // 열려 있는 모달: null | 'category' | 'goal' | 'members'
  const [openModal, setOpenModal] = useState(null);

  const canSubmit = groupName.trim() && category && goal && members;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // 백엔드 연동 시 여기서 API 호출
    alert('모임이 생성되었습니다!');
    navigate(-1);
  };

  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>

      {/* ── 헤더 ── */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center', padding: '0 20px',
        backgroundColor: '#fff', borderBottom: '1px solid #F0F0F0',
        flexShrink: 0, position: 'relative',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 1 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="#333D4B" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <h1 style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', pointerEvents: 'none',
        }}>운동 모임 만들기</h1>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }}>

        {/* ── 폼 카드 ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

          {/* 그룹명 */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>그룹명</p>
            <div style={{
              border: '1px solid #E5E8EB', borderRadius: '12px', padding: '11px 14px',
              display: 'flex', alignItems: 'center', backgroundColor: '#DBE9F9',
            }}>
              <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="그룹명을 적어주세요."
                style={{
                  flex: 1, border: 'none', outline: 'none', background: '#DBE9F9',
                  fontSize: 14, color: '#191F28',
                }}
              />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="#B0B8C1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 세부사항 */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>세부사항</p>
            <div style={{ border: '1px solid #E5E8EB', borderRadius: 12, overflow: 'hidden', backgroundColor: '#DBE9F9' }}>
              <DropdownRow
                placeholder="카테고리"
                value={category}
                onClick={() => setOpenModal('category')}
              />
              <DropdownRow
                placeholder="한 주 목표 횟수"
                value={goal}
                onClick={() => setOpenModal('goal')}
              />
              <DropdownRow
                placeholder="모집인원"
                value={members}
                onClick={() => setOpenModal('members')}
              />
            </div>
          </div>

          {/* 그룹 소개/규칙 */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: '700', color: '#191F28' }}>그룹 소개/규칙</p>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="어떤 그룹인가요?"
              rows={5}
              style={{
                width: '100%', border: '1px solid #E5E8EB', borderRadius: 10,
                padding: '12px 14px', fontSize: 14, color: '#191F28',
                outline: 'none', resize: 'none', boxSizing: 'border-box',
                lineHeight: 1.6, fontFamily: 'inherit', backgroundColor: '#DBE9F9',
              }}
            />
          </div>
        </div>

        {/* ── 생성하기 버튼 ── */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', marginTop: 16, padding: '15px 0',
            backgroundColor: canSubmit ? '#1E59DA' : '#B0BEC5',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: '700', cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          생성하기
        </button>
      </div>

      {/* ── 선택 모달 ── */}
      {openModal === 'category' && (
        <SelectModal
          title="카테고리 선택"
          options={CATEGORIES}
          selected={category}
          onSelect={setCategory}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'goal' && (
        <SelectModal
          title="목표 선택"
          options={GOALS}
          selected={goal}
          onSelect={setGoal}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'members' && (
        <SelectModal
          title="모집 인원"
          options={MEMBERS}
          selected={members}
          onSelect={setMembers}
          onClose={() => setOpenModal(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}