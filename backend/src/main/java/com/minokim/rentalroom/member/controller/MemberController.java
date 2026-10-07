package com.minokim.rentalroom.member.controller;

import com.minokim.rentalroom.member.dto.CreateMemberRequest;
import com.minokim.rentalroom.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/api/members")
    @ResponseStatus(HttpStatus.CREATED)
    public void createMember(@Valid @RequestBody CreateMemberRequest request) {
        memberService.createMember(request);
    }
}
