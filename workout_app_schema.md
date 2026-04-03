# 열정을 품은 덤벨 — DB Schema v2

## 테이블 목록

| 테이블 | 설명 |
|---|---|
| `users` | 유저 기본 정보 |
| `user_goals` | 유저 운동 목표 |
| `exercise_types` | 운동 종류 마스터 (MET 값 포함) |
| `workout_sessions` | 운동 세션 (1회 운동 = 1 row) |
| `workout_tracks` | 세션 내 독립 타이머 트랙 |
| `friendships` | 친구 관계 |
| `groups` | 그룹 |
| `group_members` | 그룹 멤버 |
| `ai_coaching_logs` | AI 체형 코칭 요청/응답 로그 |

---

## users

유저 기본 정보. 키/몸무게는 칼로리 계산에 직접 사용된다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(50) | |
| birth_date | DATE | |
| gender | ENUM('male','female') | |
| height_cm | FLOAT | 칼로리 계산용 |
| weight_kg | FLOAT | 칼로리 계산용 |
| created_at | TIMESTAMP | |

---

## user_goals

목표는 수시로 변경되므로 users와 분리. 마이페이지 수정 시 업데이트.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK | users.id |
| weekly_count | INT | 주 목표 횟수 |
| duration_min | INT | 1회 목표 운동 시간 (분) |
| calorie_target | INT | 1회 목표 칼로리 |
| updated_at | TIMESTAMP | ON UPDATE 자동 갱신 |

---

## exercise_types

운동 종류 마스터 테이블. 서버 시작 시 시드 데이터로 채워두고 변경하지 않는다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(50) | 걷기, 달리기, 상체, 하체 … |
| category | VARCHAR(50) | 러닝, 헬스, 홈트, 요가 … |
| met_value | FLOAT | 칼로리 계산 공식: `MET × weight × 0.0175 × 시간(분)` |

**시드 데이터 예시**

| category | name | met_value |
|---|---|---|
| 러닝 | 걷기 | 3.5 |
| 러닝 | 달리기 | 10.0 |
| 헬스 | 상체 | 5.0 |
| 헬스 | 하체 | 6.0 |
| 헬스 | 코어 | 4.0 |
| 홈트 | 전신 | 6.0 |
| 요가 | 스트레칭 | 2.5 |
| 수영 | 전신 | 8.0 |

---

## workout_sessions

1회 운동 = 1 row. `is_active`가 TRUE인 유저를 조회해 "지금 운동 중인 친구" 목록을 만든다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK | users.id |
| started_at | TIMESTAMP | 운동 시작 시각 |
| ended_at | TIMESTAMP NULL | 운동 종료 시각 |
| total_duration_sec | INT | 세션 전체 경과 시간 (초) |
| total_calories | FLOAT | 세션 전체 소모 칼로리 |
| is_active | BOOLEAN | TRUE = 현재 운동 중 |

---

## workout_tracks

세션 내에서 독립 타이머로 운영되는 각 트랙. 운동 선택 화면에서 고른 운동의 서브카테고리 수만큼 생성된다.

**예: 헬스 선택 → 상체/하체 두 트랙 생성**

| session_id | exercise_type_id | track_order | status | elapsed_sec |
|---|---|---|---|---|
| 1 | 3 (헬스-상체) | 1 | paused | 1930 |
| 1 | 4 (헬스-하체) | 2 | running | 580 |

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| session_id | BIGINT FK | workout_sessions.id |
| exercise_type_id | BIGINT FK | exercise_types.id |
| track_order | INT | 화면 표시 순서 |
| status | ENUM | idle / running / paused / done |
| elapsed_sec | INT | 누적 경과 시간 (초) |
| calories | FLOAT | 이 트랙의 소모 칼로리 |
| started_at | TIMESTAMP NULL | 트랙 최초 시작 시각 |
| paused_at | TIMESTAMP NULL | 일시정지 시각 (재개 시 경과 시간 계산용) |

---

## friendships

양방향 친구 관계. (A→B), (B→A) 두 row로 관리하거나 단방향으로 관리 후 쿼리에서 합산하는 방식 모두 가능.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK | 요청한 유저 |
| friend_id | BIGINT FK | 요청받은 유저 |
| status | ENUM | pending / accepted / blocked |
| created_at | TIMESTAMP | |

---

## groups / group_members

마이페이지의 "속한 그룹 수" 기능에 대응. MVP 후순위면 나중에 추가해도 무방.

**groups**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(100) | |
| created_by | BIGINT FK | users.id |
| created_at | TIMESTAMP | |

**group_members**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| group_id | BIGINT FK | groups.id |
| user_id | BIGINT FK | users.id |
| role | ENUM | owner / member |
| joined_at | TIMESTAMP | |

---

## ai_coaching_logs

AI 코칭 요청/응답 전체를 로그로 보존. `recommended_routine`은 JSON으로 구조화해 홈화면 루틴 연동에 활용한다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK | users.id |
| image_url | VARCHAR(500) NULL | S3 등 스토리지 URL |
| body_description | TEXT NULL | 유저 직접 입력 체형 고민 |
| ai_response | TEXT NULL | AI 전체 응답 텍스트 |
| recommended_routine | JSON NULL | 추천 루틴 구조화 데이터 |
| created_at | TIMESTAMP | |

**recommended_routine JSON 예시**

```json
{
  "routines": [
    { "name": "스쿼트", "sets": 4, "reps": "8~12" },
    { "name": "런지", "sets": 3, "reps": "10~12" },
    { "name": "힙 쓰러스트", "sets": 3, "reps": "10~12" }
  ]
}
```

---

## 칼로리 계산 공식

```
칼로리(kcal) = MET × 체중(kg) × 0.0175 × 운동시간(분)

초 단위일 경우:
칼로리(kcal) = MET × 체중(kg) × 0.0175 × (elapsed_sec / 60)
```

트랙별로 계산 후 합산해 `workout_sessions.total_calories`에 저장한다.
