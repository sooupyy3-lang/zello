const BASE_URL = 'https://dgc2o9mw3cae4.cloudfront.net';

// ── 토큰 관리 ──────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUserId = () => localStorage.getItem('userId');
export const setUserId = (id) => localStorage.setItem('userId', String(id));
export const getUserName = () => localStorage.getItem('userName');
export const setUserName = (name) => localStorage.setItem('userName', name);

export const logout = () => {
  removeToken();
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
};
// ── 공통 fetch 래퍼 ────────────────────────────────────
async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : null),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '서버 오류');
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ───────────────────────────────────────────────
// POST /api/auth/register
export async function register(userInfo) {
  const data = await request('POST', '/api/auth/register', {
    name: userInfo.name,
    birthDate: userInfo.birth,
    gender: userInfo.gender,
    heightCm: parseFloat(userInfo.height),
    weightKg: parseFloat(userInfo.weight),
    weeklyCount: parseInt(userInfo.goalWeek) || 3,
    durationMin: parseInt(userInfo.goalTime) * 60 || 60,
    calorieTarget: parseInt(userInfo.goalCal) || 500,
    kakaoId: userInfo.kakaoId || null,
  });
  setToken(data.token);
  setUserId(data.userId);
  setUserName(data.name);
  return data;
}

// POST /api/auth/login
export async function login(userId) {
  const data = await request('POST', '/api/auth/login', { userId: parseInt(userId) });
  setToken(data.token);
  setUserId(data.userId);
  setUserName(data.name);
  return data;
}

// ── Workout ────────────────────────────────────────────
// GET /api/workouts/home
export const getHome = () => request('GET', '/api/workouts/home');

// POST /api/workouts/sessions
export const startSession = (exerciseTypeIds) =>
  request('POST', '/api/workouts/sessions', { exerciseTypeIds });

// GET /api/workouts/sessions?date=YYYY-MM-DD
export const getSessionByDate = (date) =>
  request('GET', `/api/workouts/sessions?date=${date}`);

// GET /api/workouts/sessions/today
export const getTodaySession = () => request('GET', '/api/workouts/sessions/today');

// PATCH /api/workouts/tracks/:trackId
export const updateTrack = (trackId, status, elapsedSec) =>
  request('PATCH', `/api/workouts/tracks/${trackId}`, { status, elapsedSec });

// POST /api/workouts/sessions/end
export const endSession = () => request('POST', '/api/workouts/sessions/end');

// GET /api/exercises?category=
export const getExercises = (category) =>
  request('GET', `/api/exercises${category ? `?category=${category}` : ''}`);

// GET /api/exercises/categories
export const getExerciseCategories = () => request('GET', '/api/exercises/categories');

// ── Calendar ───────────────────────────────────────────
// GET /api/workouts/sessions?date=  (날짜별)
export const getSessionsByMonth = async (year, month) => {
  // 해당 달의 각 날짜를 체크하는 대신 홈 API로 workedOutDates 활용
  return request('GET', '/api/workouts/home');
};

// ── AI Coaching ────────────────────────────────────────
// POST /api/ai/coaching (multipart)
export async function requestAiCoaching(bodyDescription, imageFile) {
  const formData = new FormData();
  if (bodyDescription) formData.append('bodyDescription', bodyDescription);
  if (imageFile) formData.append('image', imageFile);
  return request('POST', '/api/ai/coaching', formData, true);
}

// GET /api/ai/coaching/latest
export const getLatestCoaching = () => request('GET', '/api/ai/coaching/latest');
// GET /api/ai/coaching/applied — 현재 적용(선택)된 루틴
export const getAppliedCoaching = () => request('GET', '/api/ai/coaching/applied');
export const applyCoachingRoutine = (logId) =>
  request('POST', `/api/ai/coaching/${logId}/apply`);
// ── User ───────────────────────────────────────────────
// GET /api/users/me
export const getMyProfile = () => request('GET', '/api/users/me');

// PUT /api/users/me
export const updateProfile = async (userInfo) => {
  const data = await request('PUT', '/api/users/me', {
    name: userInfo.name,
    birthDate: userInfo.birth,
    gender: userInfo.gender,
    heightCm: parseFloat(userInfo.height),
    weightKg: parseFloat(userInfo.weight),
    weeklyCount: parseInt(userInfo.goalWeek) || 3,
    durationMin: parseInt(userInfo.goalTime) * 60 || 60,
    calorieTarget: parseInt(userInfo.goalCal) || 500,
  });
  setUserName(userInfo.name);
  return data;
};

// ── Stats ──────────────────────────────────────────────
export const getMyStats = () => request('GET', '/api/stats/me');

// ── Nickname ───────────────────────────────────────────
export const checkNickname = (name) =>
  request('GET', `/api/auth/check-nickname?name=${encodeURIComponent(name)}`);

// ── Kakao ──────────────────────────────────────────────
export async function getKakaoLoginUrl(redirectUri) {
  return request('GET', `/api/auth/kakao/url?redirectUri=${encodeURIComponent(redirectUri)}`);
}

export async function kakaoLogin(code, redirectUri) {
  const data = await request('POST', `/api/auth/kakao/login?code=${encodeURIComponent(code)}&redirectUri=${encodeURIComponent(redirectUri)}`);
  if (!data.isNewUser) {
    setToken(data.token);
    setUserId(data.userId);
    setUserName(data.name);
  }
  return data;
}

// ── AI History ─────────────────────────────────────────
export const getCoachingHistory = () => request('GET', '/api/ai/coaching/history');

// ── Rankings ───────────────────────────────────────────
export const getRankings = (type = 'time') => request('GET', `/api/rankings?type=${type}`);

// ── Friends Active ─────────────────────────────────────
export const getActiveFriends = () => request('GET', '/api/friends/active');

// ── Friends ────────────────────────────────────────────
// GET /api/friends — 친구 목록(수락된 친구)
export const getFriends = () => request('GET', '/api/friends');

// GET /api/friends/requests — 받은 친구 요청 목록
export const getFriendRequests = () => request('GET', '/api/friends/requests');

// POST /api/friends/by-nickname?nickname= — 닉네임으로 친구 요청 보내기
export const sendFriendRequestByNickname = (nickname) =>
  request('POST', `/api/friends/by-nickname?nickname=${encodeURIComponent(nickname)}`);

// POST /api/friends/:targetId — userId로 친구 요청 보내기
export const sendFriendRequest = (targetId) =>
  request('POST', `/api/friends/${targetId}`);

// PATCH /api/friends/:requesterId/accept — 친구 요청 수락
export const acceptFriendRequest = (requesterId) =>
  request('PATCH', `/api/friends/${requesterId}/accept`);

// DELETE /api/friends/:targetId — 친구 삭제 / 요청 거절
export const deleteFriend = (targetId) =>
  request('DELETE', `/api/friends/${targetId}`);

// DELETE /api/groups/:groupId — 그룹 삭제 (방장만)
export const deleteGroup = (groupId) =>
  request('DELETE', `/api/groups/${groupId}`);

// PATCH /api/groups/:groupId/owner — 방장 권한을 다른 멤버에게 위임 (방장만)
// 요청 바디 제안: { newOwnerId: number }
export const delegateGroupOwner = (groupId, newOwnerId) =>
  request('PATCH', `/api/groups/${groupId}/owner`, { newOwnerId });

// GET /api/groups/:groupId/active — 그룹 멤버 중 현재 운동 중인 사람 목록
export const getGroupActiveMembers = (groupId) =>
  request('GET', `/api/groups/${groupId}/active`);

// GET /api/groups/:groupId/members/:targetUserId/stats — 그룹원 상세 통계
export const getGroupMemberStats = (groupId, targetUserId) =>
  request('GET', `/api/groups/${groupId}/members/${targetUserId}/stats`);

// ── Groups ─────────────────────────────────────────────
// POST /api/groups — 그룹 생성
export const createGroup = (group) =>
  request('POST', '/api/groups', {
    name: group.name,
    description: group.description,
    category: group.category,
    goal: group.goal,
    maxMembers: group.maxMembers ?? null,
  });

// GET /api/groups?keyword=&sort=recent|members — 그룹 탐색
export const exploreGroups = (keyword, sort) => {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);
  const qs = params.toString();
  return request('GET', `/api/groups${qs ? `?${qs}` : ''}`);
};

// GET /api/groups/my — 내 그룹 목록
export const getMyGroups = () => request('GET', '/api/groups/my');

// GET /api/groups/:groupId — 그룹 상세
export const getGroup = (groupId) => request('GET', `/api/groups/${groupId}`);

// POST /api/groups/join?inviteCode= — 초대 코드로 가입
export const joinGroupByCode = (inviteCode) =>
  request('POST', `/api/groups/join?inviteCode=${encodeURIComponent(inviteCode)}`);

// POST /api/groups/:groupId/join — 그룹 탐색(검색)에서 바로 가입 (초대코드 불필요)
export const joinGroupById = (groupId) =>
  request('POST', `/api/groups/${groupId}/join`);

// DELETE /api/groups/:groupId/leave — 그룹 탈퇴
export const leaveGroup = (groupId) =>
  request('DELETE', `/api/groups/${groupId}/leave`);

// PUT /api/groups/:groupId — 그룹 정보 수정 (방장만)
export const updateGroup = (groupId, group) =>
  request('PUT', `/api/groups/${groupId}`, {
    name: group.name,
    description: group.description,
    category: group.category,
    goal: group.goal,
    maxMembers: group.maxMembers ?? null,
  });

// DELETE /api/groups/:groupId/members/:targetUserId — 그룹원 내보내기 (방장만)
export const kickGroupMember = (groupId, targetUserId) =>
  request('DELETE', `/api/groups/${groupId}/members/${targetUserId}`);
