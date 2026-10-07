package com.minokim.rentalroom.member.exception;

public class InvalidInputException extends RuntimeException {
    private final String field;

    public InvalidInputException(String field) {
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
