package com.darlemlih.apiculture.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String sku;
    
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
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private String currency = "MAD";
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private Integer stockQuantity = 0;
    
    private Integer weightGrams;
    
    @Column(columnDefinition = "TEXT")
    private String ingredients;
    
    private String origin;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean isHalal = true;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean isFeatured = false;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @lombok.Builder.Default
    private List<String> images = new ArrayList<>();

    /**
     * Optimistic locking discriminator used during stock decrement at checkout.
     * See OrderService.persistOrder for the retry loop.
     */
    @jakarta.persistence.Version
    @Column(nullable = false)
    @lombok.Builder.Default
    private Long version = 0L;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();
}
