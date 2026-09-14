package com.darlemlih.apiculture.repositories;

import com.darlemlih.apiculture.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByIsActiveTrueOrderByDisplayOrder();

    /**
     * Count active products in a category WITHOUT loading the full collection
     * (avoids the N+1 from {@code category.getProducts().size()}).
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :id AND p.isActive = true")
    long countActiveByCategoryId(@Param("id") Long id);
}
