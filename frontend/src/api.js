const BASE_URL = 'http://localhost:8080';

// ── 토큰 관리 ──────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUserId = () => localStorage.getItem('userId');
export const setUserId = (id) => localStorage.setItem('userId', String(id));
export const getUserName = () => localStorage.getItem('userName');
export const setUserName = (name) => localStorage.setItem('userName', name);

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
    gender: userInfo.gender,          // 'male' | 'female'
    heightCm: parseFloat(userInfo.height),
    weightKg: parseFloat(userInfo.weight),
    weeklyCount: parseInt(userInfo.goalWeek) || 3,
    durationMin: parseInt(userInfo.goalTime) * 60 || 60,
    calorieTarget: parseInt(userInfo.goalCal) || 500,
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

// ── User ───────────────────────────────────────────────
// GET /api/users/me
export const getMyProfile = () => request('GET', '/api/users/me');

// PUT /api/users/me
export const updateProfile = (userInfo) =>
  request('PUT', '/api/users/me', {
    name: userInfo.name,
    birthDate: userInfo.birth,
    gender: userInfo.gender,
    heightCm: parseFloat(userInfo.height),
    weightKg: parseFloat(userInfo.weight),
    weeklyCount: parseInt(userInfo.goalWeek) || 3,
    durationMin: parseInt(userInfo.goalTime) * 60 || 60,
    calorieTarget: parseInt(userInfo.goalCal) || 500,
  });

// ── Stats ──────────────────────────────────────────────
export const getMyStats = () => request('GET', '/api/stats/me');
