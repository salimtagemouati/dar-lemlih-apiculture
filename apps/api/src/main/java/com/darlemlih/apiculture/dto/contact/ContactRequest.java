package com.darlemlih.apiculture.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "name is required")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "email is required")
    @Email
    private String email;

    @NotBlank(message = "subject is required")
    @Size(max = 200)
    private String subject;

    @NotBlank(message = "message is required")
    @Size(min = 10, max = 4000)
    private String message;
}
