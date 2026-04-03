# 열정을 품은 덤벨 — Backend

Spring Boot 3.2 + MySQL 8 기반 REST API 서버

---

## 시작하기

### 1. MySQL 데이터베이스 생성
```sql
CREATE DATABASE dumbbell CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. application.yml 수정
```yaml
spring.datasource.password: 본인 MySQL 비밀번호
jwt.secret: 256비트 이상의 랜덤 문자열로 교체
api: google 제미나이 api 붙여넣기
```

### 3. 서버 실행
```bash
./gradlew bootRun
```
JPA `ddl-auto: update` 로 설정되어 있어 테이블이 자동 생성됩니다.

### 4. 시드 데이터 삽입
```bash
mysql -u root -p dumbbell < workout_app/schema.sql
```

---

## 프로젝트 구조

```
src/main/java/com/dumbbell/
├── DumbbellApplication.java
├── config/
│   ├── JwtUtil.java
│   └── SecurityConfig.java
├── controller/
│   ├── AiCoachingController.java
│   ├── AuthController.java
│   ├── FriendController.java
│   ├── StatsController.java
│   ├── UserController.java
│   └── WorkoutController.java
├── dto/
│   ├── AiCoachingRequest.java
│   ├── AiCoachingResponse.java
│   ├── FriendResponse.java
│   ├── HomeResponse.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── SessionResponse.java
│   ├── SessionStartRequest.java
│   ├── TokenResponse.java
│   ├── TrackUpdateRequest.java
│   └── UserProfileResponse.java
├── entity/
│   ├── ExerciseType.java
│   ├── SocialEntities.java     # Friendship / Group / GroupMember / AiCoachingLog
│   ├── User.java
│   ├── UserGoal.java
│   ├── WorkoutSession.java
│   └── WorkoutTrack.java
├── repository/
│   ├── AiCoachingLogRepository.java
│   ├── ExerciseTypeRepository.java
│   ├── FriendshipRepository.java
│   ├── GroupMemberRepository.java
│   ├── GroupRepository.java
│   ├── UserGoalRepository.java
│   ├── UserRepository.java
│   ├── WorkoutSessionRepository.java
│   └── WorkoutTrackRepository.java
└── service/
    ├── AiCoachingService.java
    ├── FriendService.java
    ├── StatsService.java
    ├── UserService.java
    └── WorkoutService.java
```

---

## API 명세

### 인증 (토큰 불필요)

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |

**회원가입 요청 예시**
```json
{
  "name": "조서영",
  "birthDate": "2001-05-16",
  "gender": "female",
  "heightCm": 161,
  "weightKg": 58,
  "weeklyCount": 2,
  "durationMin": 60,
  "calorieTarget": 400
}
```

**응답**
```json
{
  "token": "eyJ...",
  "userId": 1,
  "name": "조서영"
}
```

---

### 이후 모든 요청 — Authorization 헤더 필요
```
Authorization: Bearer {token}
```

---

### 유저

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/users/me` | 내 프로필 조회 |
| PUT | `/api/users/me` | 프로필/목표 수정 |

---

### 운동

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/workouts/home` | 홈화면 데이터 |
| GET | `/api/exercises?category=헬스` | 운동 종류 목록 |
| POST | `/api/workouts/sessions` | 운동 세션 시작 |
| GET | `/api/workouts/sessions/today` | 오늘 세션 조회 |
| GET | `/api/workouts/sessions?date=2026-03-13` | 특정 날 기록 |
| PATCH | `/api/workouts/tracks/{trackId}` | 트랙 재생/일시정지 |
| POST | `/api/workouts/sessions/end` | 운동 종료 |

**세션 시작 요청 예시** (헬스 선택 → 상체 + 하체 두 트랙)
```json
{
  "exerciseTypeIds": [3, 4]
}
```

**트랙 상태 변경 예시** (일시정지)
```json
{
  "status": "paused",
  "elapsedSec": 1930
}
```

---

## 칼로리 계산 방식

```
칼로리(kcal) = MET × 체중(kg) × 0.0175 × 시간(분)
```

- 트랙별 독립 계산 후 세션 합산
- 프론트에서 타이머 돌리다가 PATCH 호출 시 서버에서 최종 계산
- 칼로리는 추정치임을 UI에 명시 (와이어프레임 반영)
