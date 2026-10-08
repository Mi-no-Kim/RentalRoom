package com.minokim.rentalroom.member.controller;

import com.minokim.rentalroom.member.dto.CreateMemberRequest;
import com.minokim.rentalroom.member.dto.MemberFieldAvailabilityResponse;
import com.minokim.rentalroom.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/api/members/availability")
    public MemberFieldAvailabilityResponse checkFieldValid(
            @RequestParam(required = false) String field, @RequestParam(required = false) String value) {
        return memberService.checkAvailable(field, value);
    }
}
