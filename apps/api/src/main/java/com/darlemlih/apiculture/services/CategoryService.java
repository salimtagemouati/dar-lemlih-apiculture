package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.category.CategoryDto;
import com.darlemlih.apiculture.entities.Category;
import com.darlemlih.apiculture.exceptions.NotFoundException;
import com.darlemlih.apiculture.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrder()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("CATEGORY_NOT_FOUND", "Category not found"));
        return toDto(category);
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .slug(category.getSlug())
                .nameFr(category.getNameFr())
                .nameEn(category.getNameEn())
                .nameAr(category.getNameAr())
                .descriptionFr(category.getDescriptionFr())
                .descriptionEn(category.getDescriptionEn())
                .descriptionAr(category.getDescriptionAr())
                .image(category.getImage())
                .displayOrder(category.getDisplayOrder())
                // COUNT(*) query — no full collection load.
                .productCount(categoryRepository.countActiveByCategoryId(category.getId()))
                .build();
    }
}
