package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.product.ProductDto;
import com.darlemlih.apiculture.entities.Category;
import com.darlemlih.apiculture.entities.Product;
import com.darlemlih.apiculture.exceptions.NotFoundException;
import com.darlemlih.apiculture.repositories.CategoryRepository;
import com.darlemlih.apiculture.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductDto> searchProducts(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.searchProducts(search, categoryId, minPrice, maxPrice, pageable)
                .map(this::toDto);
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product not found"));
        return toDto(product);
    }

    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product not found"));
        return toDto(product);
    }

    public Page<ProductDto> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue(pageable)
                .map(this::toDto);
    }

    public Page<ProductDto> listAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional
    public ProductDto create(ProductDto dto) {
        Product p = new Product();
        applyDto(p, dto);
        Product saved = productRepository.save(p);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("PRODUCT_NOT_FOUND", "Product not found");
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductDto update(Long id, ProductDto dto) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product not found"));
        applyDto(p, dto);
        Product saved = productRepository.save(p);
        return toDto(saved);
    }

    private ProductDto toDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .slug(product.getSlug())
                .nameFr(product.getNameFr())
                .nameEn(product.getNameEn())
                .nameAr(product.getNameAr())
                .descriptionFr(product.getDescriptionFr())
                .descriptionEn(product.getDescriptionEn())
                .descriptionAr(product.getDescriptionAr())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .stockQuantity(product.getStockQuantity())
                .weightGrams(product.getWeightGrams())
                .ingredients(product.getIngredients())
                .origin(product.getOrigin())
                .isHalal(product.getIsHalal())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .images(product.getImages() != null ? new ArrayList<>(product.getImages()) : new ArrayList<>())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getNameFr() : null)
                .build();
    }

    private void applyDto(Product p, ProductDto dto) {
        if (dto.getSku() != null) p.setSku(dto.getSku());
        if (dto.getSlug() != null) p.setSlug(dto.getSlug());
        if (dto.getNameFr() != null) p.setNameFr(dto.getNameFr());
        if (dto.getNameEn() != null) p.setNameEn(dto.getNameEn());
        if (dto.getNameAr() != null) p.setNameAr(dto.getNameAr());
        // Descriptions are nullable in the schema; explicit assignment allows clearing.
        p.setDescriptionFr(dto.getDescriptionFr());
        p.setDescriptionEn(dto.getDescriptionEn());
        p.setDescriptionAr(dto.getDescriptionAr());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getCurrency() != null) p.setCurrency(dto.getCurrency());
        if (dto.getStockQuantity() != null) p.setStockQuantity(dto.getStockQuantity());
        p.setWeightGrams(dto.getWeightGrams());
        p.setIngredients(dto.getIngredients());
        p.setOrigin(dto.getOrigin());
        if (dto.getIsHalal() != null) p.setIsHalal(dto.getIsHalal());
        if (dto.getIsActive() != null) p.setIsActive(dto.getIsActive());
        if (dto.getIsFeatured() != null) p.setIsFeatured(dto.getIsFeatured());
        if (dto.getImages() != null) p.setImages(dto.getImages());
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
            p.setCategory(category);
        }
    }
}
