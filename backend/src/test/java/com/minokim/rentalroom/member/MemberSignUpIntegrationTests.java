package com.minokim.rentalroom.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.minokim.rentalroom.member.domain.Member;
import com.minokim.rentalroom.member.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
public class MemberSignUpIntegrationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:18.6");

    @Autowired
    MockMvc mockMvc;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanUp() {
        memberRepository.deleteAll();
    }

    private ResultActions postSignUp(
            String loginId, String password, String familyName, String givenName, String nickname) throws Exception {
        String requestBody = """
            {
               "loginId": "%s",
               "password": "%s",
               "familyName": "%s",
               "givenName": "%s",
               "nickname": "%s"
            }""".formatted(loginId, password, familyName, givenName, nickname);

        return mockMvc.perform(
                post("/api/members").contentType(MediaType.APPLICATION_JSON).content(requestBody));
    }

    @Test
    void createMemberReturnsCreatedAndPersistsMember() throws Exception {
        // given
        String loginId = "rental01";
        String password = "Abcdef12!";
        String familyName = "김";
        String givenName = "민수";
        String nickname = "민수_1";

        // when
        ResultActions actions = postSignUp(loginId, password, familyName, givenName, nickname);

        // then
        actions.andExpect(status().isCreated()).andExpect(content().string(""));

        Member member = memberRepository.findByLoginId(loginId).orElseThrow();

        assertThat(member.getLoginId()).isEqualTo(loginId);
        assertThat(passwordEncoder.matches(password, member.getPassword())).isTrue();
        assertThat(member.getFamilyName()).isEqualTo(familyName);
        assertThat(member.getGivenName()).isEqualTo(givenName);
        assertThat(member.getNickname()).isEqualTo(nickname);
    }

    @Test
    void createMemberDuplicateLoginId() throws Exception {
        // given
        String loginId1 = "rental01";
        String password1 = "Abcdef12!";
        String familyName1 = "김";
        String givenName1 = "민수";
        String nickname1 = "민수_1";
        postSignUp(loginId1, password1, familyName1, givenName1, nickname1).andExpect(status().isCreated());

        String loginId2 = "rental01";
        String password2 = "Abcdef12!";
        String familyName2 = "김";
        String givenName2 = "민수";
        String nickname2 = "민수_2";

        // when
        ResultActions action2 = postSignUp(loginId2, password2, familyName2, givenName2, nickname2);

        // then
        action2.andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("LOGIN_ID_ALREADY_USED"))
                .andExpect(jsonPath("$.field").value("loginId"));
        assertThat(memberRepository.count()).isEqualTo(1);
    }

    @Test
    void createMemberDuplicateNicknameCase() throws Exception {
        // given
        String loginId1 = "rental01";
        String password1 = "Abcdef12!";
        String familyName1 = "김";
        String givenName1 = "민수";
        String nickname1 = "민수_a";
        postSignUp(loginId1, password1, familyName1, givenName1, nickname1).andExpect(status().isCreated());

        String loginId2 = "rental02";
        String password2 = "Abcdef12!";
        String familyName2 = "김";
        String givenName2 = "민수";
        String nickname2 = "민수_A";

        // when
        ResultActions action2 = postSignUp(loginId2, password2, familyName2, givenName2, nickname2);

        // then
        action2.andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("NICKNAME_ALREADY_USED"))
                .andExpect(jsonPath("$.field").value("nickname"));
        assertThat(memberRepository.count()).isEqualTo(1);
    }

    @Test
    void invalidFieldReturnsBadRequest() throws Exception {
        // given
        String loginId1 = "rental01";
        String password1 = "Abcdef12!";
        String familyName1 = "김";
        String givenName1 = "민수";
        String nickname1 = "민수_a";

        String loginId2 = "비정상아이디01";
        String password2 = "abcdefgh";
        String familyName2 = "kim";
        String givenName2 = "minsu";
        String nickname2 = "민수 b";

        // when
        ResultActions action1 = postSignUp(loginId2, password1, familyName1, givenName1, nickname1);
        ResultActions action2 = postSignUp(loginId1, password2, familyName1, givenName1, nickname1);
        ResultActions action3 = postSignUp(loginId1, password1, familyName2, givenName1, nickname1);
        ResultActions action4 = postSignUp(loginId1, password1, familyName1, givenName2, nickname1);
        ResultActions action5 = postSignUp(loginId1, password1, familyName1, givenName1, nickname2);

        // then
        action1.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("loginId"));
        action2.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("password"));
        action3.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("familyName"));
        action4.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("givenName"));
        action5.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.field").value("nickname"));
        assertThat(memberRepository.count()).isEqualTo(0);
    }

    @Test
    void createMemberDuplicateName() throws Exception {
        // given
        String loginId1 = "rental01";
        String password1 = "Abcdef12!";
        String familyName1 = "김";
        String givenName1 = "민수";
        String nickname1 = "민수_a";
        postSignUp(loginId1, password1, familyName1, givenName1, nickname1).andExpect(status().isCreated());

        String loginId2 = "rental02";
        String nickname2 = "민수_b";

        // when
        ResultActions action = postSignUp(loginId2, password1, familyName1, givenName1, nickname2);

        // then
        action.andExpect(status().isCreated());
        assertThat(memberRepository.count()).isEqualTo(2);
    }
}
