package com.dumbbell.service;

import com.dumbbell.config.JwtUtil;
import com.dumbbell.entity.User;
import com.dumbbell.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoService {

    @Value("${kakao.client-id}")
    private String clientId;

    private final RestTemplate      restTemplate;
    private final UserRepository    userRepo;
    private final JwtUtil           jwtUtil;

    private static final String AUTH_URL  = "https://kauth.kakao.com/oauth/authorize";
    private static final String TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String USER_URL  = "https://kapi.kakao.com/v2/user/me";

    public String buildAuthUrl(String redirectUri) {
        return AUTH_URL
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code";
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    public Map<String, Object> processLogin(String code, String redirectUri) {
        String accessToken = getAccessToken(code, redirectUri);
        Map kakaoUser      = getUserInfo(accessToken);

        String kakaoId = String.valueOf(kakaoUser.get("id"));
        String name    = extractNickname(kakaoUser);

        Optional<User> existing = userRepo.findByKakaoId(kakaoId);
        if (existing.isPresent()) {
            User user = existing.get();
            return Map.of(
                    "isNewUser", false,
                    "token",  jwtUtil.generateToken(user.getId()),
                    "userId", user.getId(),
                    "name",   user.getName()
            );
        } else {
            return Map.of("isNewUser", true, "kakaoId", kakaoId, "name", name);
        }
    }

    @SuppressWarnings("rawtypes")
    private String getAccessToken(String code, String redirectUri) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type",   "authorization_code");
        params.add("client_id",    clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code",         code);

        HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(params, headers);
        ResponseEntity<Map> res = restTemplate.postForEntity(TOKEN_URL, req, Map.class);
        return (String) res.getBody().get("access_token");
    }

    @SuppressWarnings("rawtypes")
    private Map getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> req = new HttpEntity<>(headers);
        ResponseEntity<Map> res = restTemplate.exchange(USER_URL, HttpMethod.GET, req, Map.class);
        return res.getBody();
    }

    @SuppressWarnings("unchecked")
    private String extractNickname(Map<?, ?> kakaoUser) {
        try {
            Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoUser.get("kakao_account");
            Map<String, Object> profile      = (Map<String, Object>) kakaoAccount.get("profile");
            String nickname = (String) profile.get("nickname");
            return nickname != null ? nickname : "사용자";
        } catch (Exception e) {
            return "사용자";
        }
    }
}
