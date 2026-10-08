package com.minokim.rentalroom.member.service;

import com.minokim.rentalroom.member.domain.Member;
import com.minokim.rentalroom.member.dto.CreateMemberRequest;
import com.minokim.rentalroom.member.dto.MemberFieldAvailabilityResponse;
import com.minokim.rentalroom.member.exception.InvalidInputException;
import com.minokim.rentalroom.member.repository.MemberRepository;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createMember(CreateMemberRequest request) {
        if (hasTooFewCharacterTypes(request.password())) {
            throw new InvalidInputException("password");
        }

        Member member = request.toEntity(passwordEncoder.encode(request.password()));
        memberRepository.save(member);
    }

    private boolean hasTooFewCharacterTypes(String password) {
        Set<Character> charTypeSet = new HashSet<>();
        // s: 소, b: 대, n: 숫, c: 특문
        for (char c : password.toCharArray()) {
            if ('a' <= c && c <= 'z') charTypeSet.add('s');
            else if ('A' <= c && c <= 'Z') charTypeSet.add('b');
            else if ('0' <= c && c <= '9') charTypeSet.add('n');
            else if ('!' <= c && c <= '~') charTypeSet.add('c');

            if (charTypeSet.size() >= 2) return false;
        }
        return true;
    }

    public MemberFieldAvailabilityResponse checkAvailable(String field, String value) {
        if (!"loginId".equals(field) && !"nickname".equals(field)) throw new InvalidInputException("field");
        if (value == null) throw new InvalidInputException(field);

        if ("loginId".equals(field)) {
            if (checkLoginIdInvalid(value)) throw new InvalidInputException(field);
            return new MemberFieldAvailabilityResponse(!memberRepository.existsByLoginId(value));
        } else {
            if (checkNicknameInvalid(value)) throw new InvalidInputException(field);
            return new MemberFieldAvailabilityResponse(!memberRepository.existsByNicknameIgnoreCase(value));
        }
    }

    private boolean checkLoginIdInvalid(String loginId) {
        if (20 < loginId.length() || loginId.length() < 6) return true;
        for (char c : loginId.toCharArray()) {
            if ('a' <= c && c <= 'z' || '0' <= c && c <= '9') continue;
            return true;
        }
        return false;
    }

    private boolean checkNicknameInvalid(String nickname) {
        if (12 < nickname.length() || nickname.length() < 2) return true;
        for (char c : nickname.toCharArray()) {
            if ('a' <= c && c <= 'z'
                    || 'A' <= c && c <= 'Z'
                    || '가' <= c && c <= '힣'
                    || '0' <= c && c <= '9'
                    || c == '_'
                    || c == '-') continue;
            return true;
        }
        return false;
    }
}
