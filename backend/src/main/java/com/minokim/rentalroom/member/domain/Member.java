package com.minokim.rentalroom.member.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "members")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String familyName;

    @Column(nullable = false)
    private String givenName;

    @Column(nullable = false)
    private String nickname;

    public static Member create(String loginId, String password, String familyName, String givenName, String nickname) {
        Member member = new Member();
        member.loginId = loginId;
        member.password = password;
        member.familyName = familyName;
        member.givenName = givenName;
        member.nickname = nickname;

        return member;
    }
}
