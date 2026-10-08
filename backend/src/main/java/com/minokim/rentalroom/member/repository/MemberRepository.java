package com.minokim.rentalroom.member.repository;

import com.minokim.rentalroom.member.domain.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByNicknameIgnoreCase(String nickname);
}
