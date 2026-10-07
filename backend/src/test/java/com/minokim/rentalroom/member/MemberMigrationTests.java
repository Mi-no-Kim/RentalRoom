package com.minokim.rentalroom.member;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Testcontainers
@SpringBootTest
class MemberMigrationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:18.6");

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void enforcesCaseInsensitiveIdsAndNicknamesWhileAllowingDuplicateNames() {
        insertMember("rental1", "Min_1");

        assertThrows(DataIntegrityViolationException.class, () -> insertMember("RENTAL1", "Another"));
        assertThrows(DataIntegrityViolationException.class, () -> insertMember("rental2", "min_1"));
        assertDoesNotThrow(() -> insertMember("rental2", "Another"));

        insertMember("rental3", "I_방");
        assertThrows(DataIntegrityViolationException.class, () -> insertMember("rental4", "i_방"));
    }

    private void insertMember(String loginId, String nickname) {
        jdbcTemplate.update(
                "INSERT INTO members (login_id, password, family_name, given_name, nickname) VALUES (?, ?, ?, ?, ?)",
                loginId,
                "encoded-password",
                "김",
                "민수",
                nickname);
    }
}
