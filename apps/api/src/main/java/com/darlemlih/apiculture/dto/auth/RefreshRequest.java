package com.darlemlih.apiculture.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshRequest {
    @NotBlank(message = "refreshToken is required")
    private String refreshToken;
}
