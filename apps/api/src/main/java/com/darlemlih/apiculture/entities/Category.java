package com.darlemlih.apiculture.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(nullable = false)
    private String nameFr;
    
    @Column(nullable = false)
    private String nameEn;
    
    @Column(nullable = false)
    private String nameAr;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionFr;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionEn;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionAr;
    
    private String image;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
    
    @lombok.Builder.Default
    private Integer displayOrder = 0;
    
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @lombok.Builder.Default
    private List<Product> products = new ArrayList<>();
}
