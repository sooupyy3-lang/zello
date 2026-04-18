import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserImage from '../assets/Components/MyPage.svg';
import ModifyIcon from '../assets/Icon/ModifyIcon.svg';
import Profile from '../assets/Components/Profile.svg';
import { getMyStats, getUserName } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStats()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const name = profile?.name || getUserName() || '사용자';

  const basicInfo = profile ? [
    { label: '이름', value: profile.name },
    { label: '생년월일', value: profile.birthDate || '-' },
    { label: '성별', value: profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '-' },
    { label: '목표', value: profile.weeklyCount ? `주 ${profile.weeklyCount}회 / ${profile.calorieTarget}kcal` : '-' },
  ] : [
    { label: '이름', value: '' }, { label: '생년월일', value: '' },
    { label: '성별', value: '' }, { label: '목표', value: '' },
  ];

  const statsInfo = profile ? [
    { label: '최대 운동 지속 기록', value: profile.maxDuration || '-' },
    { label: '최대 운동 일수', value: profile.maxWorkoutDays != null ? `${profile.maxWorkoutDays}일` : '-' },
    { label: '최대 소모 칼로리', value: profile.maxCalories != null ? `${Math.round(profile.maxCalories)} kcal` : '-' },
    { label: '평균 운동 지속 시간', value: profile.avgDuration || '-' },
    { label: '평균 소모 칼로리', value: profile.avgCalories != null ? `${Math.round(profile.avgCalories)} kcal` : '-' },
    { label: '속한 그룹 수', value: profile.groupCount != null ? `${profile.groupCount}개` : '-' },
    { label: '친구들 수', value: profile.friendCount != null ? `${profile.friendCount}명` : '-' },
  ] : [
    '최대 운동 지속 기록', '최대 운동 일수', '최대 소모 칼로리',
    '평균 운동 지속 시간', '평균 소모 칼로리', '속한 그룹 수', '친구들 수',
  ].map((label) => ({ label, value: '-' }));

  return (
    <div style={{
      width: '100%',
      position: 'relative',
      fontFamily: 'inherit',
    }}>
      {/* 배경 SVG 전체 (마이페이지 글씨 + 프로필 + 정보 영역 모두 포함) */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '402 / 874' }}>
        <img
          src={UserImage} alt="background"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 0 }}
        />

        {/* 프로필 이미지 - top: 165/874=18.9% */}
        <img
          src={Profile} alt="profile"
          style={{
            position: 'absolute',
            top: '18.9%', left: '37.8%',
            width: 'clamp(60px, 17vw, 70px)',
            height: 'clamp(60px, 17vw, 70px)',
            zIndex: 1,
          }}
        />

        {/* 이름 - top: 250/874=28.6% */}
        <h2 style={{
          position: 'absolute',
          top: '28.6%', left: '39%',
          fontSize: 'clamp(16px, 5vw, 20px)',
          fontWeight: '700', color: '#002738',
          margin: 0, zIndex: 1, whiteSpace: 'nowrap',
        }}>
          {name} &nbsp;님
        </h2>

        {/* 수정 버튼 - top: 314/874=35.9% */}
        <button onClick={() => navigate('/Page2')}
          style={{
            position: 'absolute', left: '28.6%', top: '35.9%',
            padding: 0, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2,
          }}>
          <img src={ModifyIcon} alt="수정하기"
            style={{ width: 'clamp(48px, 14vw, 58px)', height: 'clamp(24px, 7vw, 29px)' }} />
        </button>

        {/* 기본 정보 - top: 315/874=36% */}
        <div style={{
          position: 'absolute', top: '36%', left: '8.7%', right: '6%', zIndex: 1,
        }}>
          <p style={{ fontSize: 'clamp(16px, 5vw, 20px)', fontWeight: '800', color: '#002738', margin: '0 0 6px' }}>기본 정보</p>
          <div style={{ height: '1px', backgroundColor: '#8EB3C2', marginBottom: '4px' }} />
          {basicInfo.map(({ label, value }, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 'clamp(13px, 3.7vw, 15px)', fontWeight: '700', color: '#002738' }}>{label}</span>
              <span style={{ fontSize: 'clamp(13px, 3.7vw, 15px)', fontWeight: '500', color: '#002738' }}>{value}</span>
            </div>
          ))}

          <p style={{ fontSize: 'clamp(15px, 4.5vw, 18px)', fontWeight: '800', color: '#002738', margin: 'clamp(16px, 4vw, 33px) 0 8px' }}>
            운동 기록
          </p>
          <div style={{ height: '1px', backgroundColor: '#8EB3C2', marginBottom: '4px' }} />
          {statsInfo.map(({ label, value }, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontSize: 'clamp(13px, 3.7vw, 15px)', margin: '3px', fontWeight: '700', color: '#002738' }}>{label}</span>
              <span style={{ fontSize: 'clamp(13px, 3.7vw, 15px)', margin: '3px', fontWeight: '500', color: '#002738' }}>{value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MyPage;