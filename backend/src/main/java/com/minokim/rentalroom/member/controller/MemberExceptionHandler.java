package com.minokim.rentalroom.member.controller;

import com.minokim.rentalroom.member.dto.ErrorResponse;
import com.minokim.rentalroom.member.exception.InvalidInputException;
import java.util.Objects;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class MemberExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidDto(MethodArgumentNotValidException exception) {
        String field = exception.getBindingResult().getFieldErrors().get(0).getField();
        return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_INPUT", field));
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> invalidInput(InvalidInputException exception) {
        return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_INPUT", exception.getField()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> databaseDuplicate(DataIntegrityViolationException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof ConstraintViolationException violation) {
                String name = violation.getConstraintName();

                if ("members_login_id_lower_unique".equals(name)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("LOGIN_ID_ALREADY_USED", "loginId"));
                }
                if ("members_nickname_lower_unique".equals(name)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("NICKNAME_ALREADY_USED", "nickname"));
                }
            }
            cause = cause.getCause();
        }
        throw Objects.requireNonNull(exception);
    }
}
