import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── 더미 데이터 ───────────────────────────────────────
const DUMMY_PROFILE = {
  name: '조서영',
  birthYear: '2003', birthMonth: '03', birthDay: '22',
  gender: 'female',
  height: '167', weight: '52',
  weeklyCount: '2', durationHour: '1', calorieTarget: '243',
  maxDuration: '2:41:27',
  maxWorkoutDays: 12,
  maxCalories: 894,
  avgDuration: '1:14:52',
  avgCalories: 416,
  groupCount: 2,
  friendCount: 17,
};

// ── 수정 시트 ─────────────────────────────────────────
function EditSheet({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ...profile });
  const canSave = form.name.trim().length > 0;

  const inputStyle = {
    flex: 1, border: '1px solid #E5E8EB', borderRadius: 12,
    padding: '10px 14px', fontSize: 14, color: '#1E59DA',
    outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box',
    width: '100%',
  };

  const labelStyle = {
    fontSize: 13, fontWeight: '700', color: '#191F28', marginBottom: 8, display: 'block',
  };

  return (
    <>
      {/* 딤 */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />

      {/* 시트 */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: '#E9EAEF', borderRadius: '38px 38px 0 0',
        zIndex: 101, maxHeight: '88%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* 핸들 + 닫기 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 20px 12px', position: 'relative', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>프로필 수정</p>
          <button onClick={onClose} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 스크롤 폼 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 32px' }}>

          {/* 닉네임 */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>닉네임</span>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="닉네임을 입력하세요"
              style={inputStyle}
            />
          </div>

          {/* 생년월일 */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>생년월일</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { key: 'birthYear',  placeholder: '년도', maxLen: 4 },
                { key: 'birthMonth', placeholder: '월',   maxLen: 2 },
                { key: 'birthDay',   placeholder: '일',   maxLen: 2 },
              ].map(({ key, placeholder, maxLen }) => (
                <input
                  key={key}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  maxLength={maxLen}
                  inputMode="numeric"
                  style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
                />
              ))}
            </div>
          </div>

          {/* 성별 */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>성별</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => setForm(f => ({ ...f, gender: g }))}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                    fontSize: 14, fontWeight: '600', cursor: 'pointer',
                    backgroundColor: form.gender === g ? '#1E59DA' : '#F3F4F6',
                    color: form.gender === g ? '#fff' : '#8B95A1',
                    transition: 'all 0.15s',
                  }}
                >
                  {g === 'male' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </div>

          {/* 체형 정보 */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>체형 정보</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={form.height}
                onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
                placeholder="키"
                inputMode="numeric"
                style={{ ...inputStyle, textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: '#8B95A1', whiteSpace: 'nowrap' }}>cm</span>
              <input
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                placeholder="몸무게"
                inputMode="numeric"
                style={{ ...inputStyle, textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: '#8B95A1', whiteSpace: 'nowrap' }}>kg</span>
            </div>
          </div>

          {/* 목표 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>목표</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',justifyContent: 'space-between', }}>
              <span style={{ fontSize: 13, color: '#8B95A1' }}>주</span>
              <input value={form.weeklyCount} onChange={e => setForm(f => ({ ...f, weeklyCount: e.target.value }))} inputMode="numeric" style={{ ...inputStyle, width: 65, flex: 'none', textAlign: 'center', padding: '10px 6px' }} />
              <span style={{ fontSize: 13, color: '#8B95A1' }}>회</span>
              <input value={form.durationHour} onChange={e => setForm(f => ({ ...f, durationHour: e.target.value }))} inputMode="numeric" style={{ ...inputStyle, width: 65, flex: 'none', textAlign: 'center', padding: '10px 6px' }} />
              <span style={{ fontSize: 13, color: '#8B95A1' }}>시간</span>
              <input value={form.calorieTarget} onChange={e => setForm(f => ({ ...f, calorieTarget: e.target.value }))} inputMode="numeric" style={{ ...inputStyle, width: 65, flex: 'none', textAlign: 'center', padding: '10px 6px' }} />
              <span style={{ fontSize: 13, color: '#8B95A1' }}>칼로리</span>
            </div>
          </div>

          {/* 저장하기 */}
          <button
            onClick={() => { if (canSave) { onSave(form); onClose(); } }}
            style={{
              width: '100%', padding: '15px 0',
              backgroundColor: canSave ? '#1E59DA' : '#B0BEC5',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: '700',
              cursor: canSave ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
            }}
          >
            저장하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}

// ── 로그아웃 모달 ─────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: 20,
        padding: '32px 24px 24px', zIndex: 201,
        width: '72%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
        animation: 'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: '700', color: '#191F28' }}>로그아웃</p>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#8B95A1' }}>로그아웃 하시겠습니까?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 44, backgroundColor: '#B0B8C1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: '600', cursor: 'pointer' }}>아니요</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 44, backgroundColor: '#1E59DA', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: '600', cursor: 'pointer' }}>예</button>
        </div>
      </div>
      <style>{`
        @keyframes popIn { from { transform: translate(-50%,-50%) scale(0.85); opacity:0; } to { transform: translate(-50%,-50%) scale(1); opacity:1; } }
      `}</style>
    </>
  );
}

// ── 정보 행 컴포넌트 ──────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F3F4F4' }}>
      <span style={{ fontSize: 13, fontWeight: '600', color: '#4E5968' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: '500', color: '#191F28' }}>{value || '-'}</span>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(DUMMY_PROFILE);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const genderLabel = profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '-';
  const birthDate = [profile.birthYear, profile.birthMonth, profile.birthDay].filter(Boolean).join('. ');
  const goalLabel = `주 ${profile.weeklyCount}회, ${profile.durationHour}시간, ${profile.calorieTarget}칼로리 소모 목표`;

  const basicInfo = [
    { label: '닉네임',   value: profile.name },
    { label: '생년월일', value: birthDate },
    { label: '성별',     value: genderLabel },
    { label: '목표',     value: goalLabel },
  ];

  const statsInfo = [
    { label: '최대 운동 지속 기록', value: profile.maxDuration },
    { label: '최대 운동 일수',     value: profile.maxWorkoutDays != null ? `${profile.maxWorkoutDays}일` : '-' },
    { label: '최대 소모 칼로리',   value: profile.maxCalories != null ? `${profile.maxCalories}kcal` : '-' },
    { label: '평균 운동 지속 시간', value: profile.avgDuration },
    { label: '평균 소모 칼로리',   value: profile.avgCalories != null ? `${profile.avgCalories}kcal` : '-' },
    { label: '속한 그룹 수',       value: profile.groupCount != null ? `${profile.groupCount}개` : '-' },
    { label: '친구들 수',          value: profile.friendCount != null ? `${profile.friendCount}명` : '-' },
  ];

  const handleLogout = () => {
    setLogoutOpen(false);
    navigate('/login');
  };

  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: '#F3F4F4',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      fontFamily: 'inherit',
    }}>

      {/* ── 헤더 ── */}
      <div style={{
        backgroundColor: '#fff', padding: '0 20px',
        height: 60, display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #F0F0F0', flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#333D4B', width: '100%', textAlign: 'center' }}>
          마이페이지
        </h1>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }}>

        {/* ── 프로필 카드 ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 아바타 */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#EBF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#B0BEC5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#B0BEC5" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: '700', color: '#191F28' }}>{profile.name} 님</p>
          </div>
        </div>

        {/* ── 기본 정보 카드 ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '20px', marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: '800', color: '#002738' }}>기본 정보</p>
            <button
              onClick={() => setEditOpen(true)}
              style={{
                padding: '5px 12px', backgroundColor: '#EBF0FF',
                color: '#000', border: '#DBE9F9', borderRadius: 20,
                fontSize: 12, fontWeight: '400', cursor: 'pointer',
              }}
            >
              수정하기
            </button>
          </div>
                  {/* ── 운동 기록 카드 ── */}

          <div style={{ height: 1, backgroundColor: '#8EB3C2', marginBottom: 4 }} />
          {basicInfo.map((row, i) => <InfoRow key={i} {...row} />)}

          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: '800', color: '#002738' }}>운동 기록</p>
          <div style={{ height: 1, backgroundColor: '#8EB3C2', marginBottom: 4 }} />
          {statsInfo.map((row, i) => <InfoRow key={i} {...row} />)}
        </div>

        

        {/* ── 로그아웃 버튼 ── */}
        <button
          onClick={() => setLogoutOpen(true)}
          style={{
            width: '90%', padding: '15px 0',display:'flex', flexDirection:'column', justifyContent:'center',flexShrink:'0',alignContent:'center',
            backgroundColor: '#1E59DA', color: '#fff',
            border: 'none', borderRadius: 14,margin: '0 auto',
            fontSize: 16, fontWeight: '500', cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* ── 수정 시트 ── */}
      {editOpen && (
        <EditSheet
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}

      {/* ── 로그아웃 모달 ── */}
      {logoutOpen && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setLogoutOpen(false)}
        />
      )}
    </div>
  );
}