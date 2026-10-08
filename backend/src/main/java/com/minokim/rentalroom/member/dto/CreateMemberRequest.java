package com.minokim.rentalroom.member.dto;

import com.minokim.rentalroom.member.domain.Member;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateMemberRequest(
        @NotBlank @Size(min = 6, max = 20) @Pattern(regexp = "^[a-z0-9]+$")
        String loginId,

        @NotBlank @Size(min = 8, max = 32) @Pattern(regexp = "^[!-~]+$")
        String password,

        @NotBlank @Size(min = 1, max = 12) @Pattern(regexp = "^[가-힣]+$")
        String familyName,

        @NotBlank @Size(min = 1, max = 12) @Pattern(regexp = "^[가-힣]+$")
        String givenName,

        @NotBlank @Size(min = 2, max = 12) @Pattern(regexp = "^[가-힣A-Za-z0-9_-]+$")
        String nickname) {

    public Member toEntity(String encodedPassword) {
        return Member.create(loginId(), encodedPassword, familyName(), givenName(), nickname());
    }
}
