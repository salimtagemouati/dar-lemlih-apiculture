package com.darlemlih.apiculture.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;
}
