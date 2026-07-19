# 젤로 (Jello)

함께하면 열정이 두 배! 함께 운동하는 jello입니다.
운동 기록, 운동 그룹 참여, ai 운동 루틴 추천 기능을 제공합니다.

## GitHub 저장소

https://github.com/sooupyy3-lang/jello

---

## 개발 환경

| 항목 | 내용 |
|---|---|
| Backend 언어/버전 | Java 17 |
| Backend 빌드 도구 | Gradle 8 (wrapper 포함, `./gradlew`) |
| Frontend 런타임 | Node.js + npm |
| Frontend 빌드 도구 | Vite 8 |
| Database | MySQL 8 (AWS RDS)|
| 컨테이너 | Docker (멀티스테이지 빌드, JDK 17 → JRE 17) |
| 환경 분리 | `application-local.yml` (로컬) / `application-prod.yml` (운영) |
| Frontend 배포 | Vercel |
| Backend 배포 | AWS Elastic Beanstalk |

---

## 개발 스택

### Backend
- Spring Boot 3.5.13
- Spring Data JPA (Hibernate) + MySQL
- Spring Security + JWT (jjwt 0.11.5, HS256)
- Kakao OAuth 2.0 (소셜 로그인)
- OpenAI API 연동 (gpt-4.1-mini, AI 운동 코칭)
- Lombok, Jakarta Validation

### Frontend
- React 19 + Vite 8
- React Router DOM 7
- Pretendard 웹폰트
- ESLint 9

### Infra
- Docker
- MySQL 8

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
```

### 3. 서버 실행
```bash
./gradlew bootRun
```

### 4. 시드 데이터 삽입
```bash
mysql -u root -p dumbbell < seed.sql
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
│   ├── AuthController.java       # 회원가입 / 로그인 / 카카오 OAuth
│   ├── UserController.java       # 프로필 / 목표
│   ├── GroupController.java      # 그룹 생성·탐색·가입·관리
│   ├── FriendController.java     # 친구 요청·수락·목록
│   ├── WorkoutController.java    # 운동 세션 · 트랙 · 종류
│   ├── RankingController.java    # 랭킹(누적시간/목표달성/출석)
│   ├── AiCoachingController.java # AI 운동 코칭
│   └── StatsController.java      # 통계
├── service/
│   ├── UserService.java
│   ├── KakaoService.java
│   ├── GroupService.java
│   ├── FriendService.java
│   ├── WorkoutService.java
│   ├── AiCoachingService.java / OpenAiCoachingClient.java
│   └── StatsService.java
├── repository/                   # Spring Data JPA (도메인별 Repository)
├── entity/
│   ├── User.java / UserGoal.java
│   ├── Group.java / GroupMember.java
│   ├── Friendship.java
│   ├── ExerciseType.java / WorkoutSession.java / WorkoutTrack.java
│   └── AiCoachingLog.java
├── dto/                           # 요청/응답 DTO
└── exception/                     # GlobalExceptionHandler + 커스텀 예외
```

---
