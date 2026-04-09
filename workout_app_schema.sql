-- =============================================
-- 열정을 품은 덤벨 - DB Schema v2
-- =============================================

-- 유저 기본 정보
CREATE TABLE users (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(50)  NOT NULL,
  birth_date   DATE         NOT NULL,
  gender       ENUM('male', 'female') NOT NULL,
  height_cm    FLOAT        NOT NULL,
  weight_kg    FLOAT        NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- 유저 목표 (수시로 변경되므로 별도 테이블)
CREATE TABLE user_goals (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT       NOT NULL,
  weekly_count   INT          NOT NULL COMMENT '주 목표 횟수',
  duration_min   INT          NOT NULL COMMENT '1회 목표 운동 시간(분)',
  calorie_target INT          NOT NULL COMMENT '1회 목표 칼로리',
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 운동 종류 마스터 (MET 값 포함, 시드 데이터로 관리)
CREATE TABLE exercise_types (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL COMMENT '걷기, 달리기, 상체, 하체 ...',
  category   VARCHAR(50)  NOT NULL COMMENT '러닝, 헬스, 홈트, 요가 ...',
  met_value  FLOAT        NOT NULL COMMENT '칼로리 계산용 MET 값'
);

-- 운동 세션 (운동 1회 = 1 session)
CREATE TABLE workout_sessions (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT       NOT NULL,
  started_at        TIMESTAMP    NOT NULL,
  ended_at          TIMESTAMP    NULL,
  total_duration_sec INT         DEFAULT 0  COMMENT '세션 전체 경과 시간(초)',
  total_calories    FLOAT        DEFAULT 0  COMMENT '세션 전체 소모 칼로리',
  is_active         BOOLEAN      DEFAULT TRUE COMMENT '현재 운동 중 여부 (친구 현황 조회용)',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 운동 트랙 (세션 내 독립 타이머로 운영되는 각 트랙)
-- 예: 헬스 선택 시 -> 상체 트랙 / 하체 트랙 각각 생성
CREATE TABLE workout_tracks (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id        BIGINT       NOT NULL,
  exercise_type_id  BIGINT       NOT NULL,
  track_order       INT          NOT NULL COMMENT '화면 표시 순서',
  status            ENUM('idle', 'running', 'paused', 'done') DEFAULT 'idle',
  elapsed_sec       INT          DEFAULT 0  COMMENT '누적 경과 시간(초)',
  calories          FLOAT        DEFAULT 0  COMMENT '이 트랙의 소모 칼로리',
  started_at        TIMESTAMP    NULL       COMMENT '트랙 최초 시작 시각',
  paused_at         TIMESTAMP    NULL       COMMENT '일시정지 시각 (재개 시 경과 시간 계산용)',
  FOREIGN KEY (session_id)       REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_type_id) REFERENCES exercise_types(id)
);

-- 친구 관계
CREATE TABLE friendships (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  friend_id   BIGINT NOT NULL,
  status      ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_friendship (user_id, friend_id)
);

-- 그룹
CREATE TABLE user_groups (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  created_by  BIGINT       NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 그룹 멤버
CREATE TABLE group_members (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id    BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  role        ENUM('owner', 'member') DEFAULT 'member',
  joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_group_member (group_id, user_id)
);

-- AI 코칭 로그
CREATE TABLE ai_coaching_logs (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT NOT NULL,
  image_url           VARCHAR(500) NULL    COMMENT 'S3 등 스토리지에 저장된 체형 사진 URL',
  body_description    TEXT         NULL    COMMENT '유저가 직접 입력한 체형 고민',
  ai_response         TEXT         NULL    COMMENT 'AI 전체 응답 텍스트',
  recommended_routine JSON         NULL    COMMENT '추천 루틴 구조화 데이터 (홈화면 연동용)',
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 시드 데이터: exercise_types
-- =============================================
INSERT INTO exercise_types (name, category, met_value) VALUES
  ('걷기',     '러닝',    3.5),
  ('달리기',   '러닝',   10.0),
  ('상체',     '헬스',    5.0),
  ('하체',     '헬스',    6.0),
  ('코어',     '헬스',    4.0),
  ('유산소',   '헬스',    7.0),
  ('전신',     '홈트',    6.0),
  ('상체',     '홈트',    4.5),
  ('하체',     '홈트',    5.5),
  ('코어',     '홈트',    4.0),
  ('스트레칭', '요가',    2.5),
  ('밸런스',   '요가',    3.0),
  ('유연성',   '요가',    2.5),
  ('코어',     '필라테스', 3.5),
  ('전신',     '필라테스', 4.0),
  ('자전거',   '유산소',  7.0),
  ('줄넘기',   '유산소', 10.0),
  ('계단',     '유산소',  8.0),
  ('구기',     '스포츠',  7.0),
  ('라켓',     '스포츠',  6.0),
  ('전신',     '수영',    8.0),
  ('기타',     '기타',    5.0);
