package com.darlemlih.apiculture.config;

import com.darlemlih.apiculture.entities.Category;
import com.darlemlih.apiculture.entities.Product;
import com.darlemlih.apiculture.repositories.CategoryRepository;
import com.darlemlih.apiculture.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("portfolio")
@RequiredArgsConstructor
@Slf4j
public class PortfolioDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        Category honeys = ensureCategory(
                "miels",
                "Miels",
                "Honeys",
                "عسل",
                "Miels naturels du terroir marocain",
                "Natural honeys from Moroccan terroirs",
                "عسل طبيعي من التراث المغربي",
                1);
        Category pollen = ensureCategory(
                "pollen",
                "Pollen",
                "Pollen",
                "حبوب اللقاح",
                "Pollen d'abeille riche en nutriments",
                "Nutrient-rich bee pollen",
                "حبوب لقاح النحل الغنية بالمغذيات",
                2);
        Category hiveProducts = ensureCategory(
                "produits-ruche",
                "Produits de la ruche",
                "Hive products",
                "منتجات النحل",
                "Propolis, gelée royale et soins naturels",
                "Propolis, royal jelly and natural care",
                "البروبوليس وغذاء الملكات والعناية الطبيعية",
                3);

        ensureProduct(
                "HNY-ORA-500",
                "miel-oranger-500g",
                "Miel d'Oranger 500g",
                "Orange Blossom Honey 500g",
                "عسل زهر البرتقال 500غ",
                "Miel floral et délicat récolté dans les vergers d'agrumes du Souss.",
                "A delicate floral honey harvested from citrus groves in the Souss region.",
                "عسل زهري لطيف يتم حصاده من بساتين الحمضيات في سوس.",
                "89.00",
                120,
                500,
                "100% miel naturel d'oranger",
                "Souss, Maroc",
                true,
                honeys,
                List.of("https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=85"));

        ensureProduct(
                "HNY-THY-500",
                "miel-thym-500g",
                "Miel de Thym 500g",
                "Thyme Honey 500g",
                "عسل الزعتر 500غ",
                "Miel ambré aux notes herbacées, issu des reliefs de l'Atlas.",
                "Amber honey with herbal notes from the Atlas Mountains.",
                "عسل كهرماني بنكهات عشبية من جبال الأطلس.",
                "95.00",
                80,
                500,
                "100% miel naturel de thym",
                "Atlas, Maroc",
                true,
                honeys,
                List.of("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=85"));

        ensureProduct(
                "HNY-EUC-500",
                "miel-eucalyptus-500g",
                "Miel d'Eucalyptus 500g",
                "Eucalyptus Honey 500g",
                "عسل الأوكالبتوس 500غ",
                "Miel foncé au caractère mentholé, parfait pour les saisons fraîches.",
                "Dark honey with a menthol character, ideal for cooler seasons.",
                "عسل داكن بطابع منعش مثالي للمواسم الباردة.",
                "85.00",
                100,
                500,
                "100% miel naturel d'eucalyptus",
                "Gharb, Maroc",
                false,
                honeys,
                List.of("https://images.unsplash.com/photo-1471943038711-ddd2a7d4c9aa?auto=format&fit=crop&w=1200&q=85"));

        ensureProduct(
                "POL-BEE-250",
                "pollen-abeille-250g",
                "Pollen d'Abeille 250g",
                "Bee Pollen 250g",
                "حبوب لقاح النحل 250غ",
                "Pollen séché naturellement, riche en protéines et minéraux.",
                "Naturally dried pollen, rich in proteins and minerals.",
                "حبوب لقاح مجففة طبيعياً وغنية بالبروتينات والمعادن.",
                "120.00",
                50,
                250,
                "100% pollen d'abeille",
                "Maroc",
                false,
                pollen,
                List.of("https://images.unsplash.com/photo-1567880905822-56f8e06fe630?auto=format&fit=crop&w=1200&q=85"));

        ensureProduct(
                "HNY-MUL-1000",
                "miel-multifloral-1kg",
                "Miel Toutes Fleurs 1kg",
                "Wildflower Honey 1kg",
                "عسل متعدد الأزهار 1كغ",
                "Assemblage saisonnier de nectars sauvages pour une dégustation généreuse.",
                "A seasonal blend of wild nectars for a generous tasting experience.",
                "مزيج موسمي من رحيق الأزهار البرية لتجربة غنية.",
                "150.00",
                60,
                1000,
                "100% miel naturel multifloral",
                "Maroc",
                false,
                hiveProducts,
                List.of("https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=85"));

        log.info("Portfolio catalog seed is ready.");
    }

    private Category ensureCategory(
            String slug,
            String nameFr,
            String nameEn,
            String nameAr,
            String descriptionFr,
            String descriptionEn,
            String descriptionAr,
            int displayOrder) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> categoryRepository.save(Category.builder()
                .slug(slug)
                .nameFr(nameFr)
                .nameEn(nameEn)
                .nameAr(nameAr)
                .descriptionFr(descriptionFr)
                .descriptionEn(descriptionEn)
                .descriptionAr(descriptionAr)
                .isActive(true)
                .displayOrder(displayOrder)
                .build()));
    }

    private void ensureProduct(
            String sku,
            String slug,
            String nameFr,
            String nameEn,
            String nameAr,
            String descriptionFr,
            String descriptionEn,
            String descriptionAr,
            String price,
            int stockQuantity,
            int weightGrams,
            String ingredients,
            String origin,
            boolean featured,
            Category category,
            List<String> images) {
        productRepository.findBySku(sku).ifPresentOrElse(
                existing -> log.debug("Portfolio product already present: {}", sku),
                () -> {
                    Product product = Product.builder()
                            .sku(sku)
                            .slug(slug)
                            .nameFr(nameFr)
                            .nameEn(nameEn)
                            .nameAr(nameAr)
                            .descriptionFr(descriptionFr)
                            .descriptionEn(descriptionEn)
                            .descriptionAr(descriptionAr)
                            .price(new BigDecimal(price))
                            .currency("MAD")
                            .stockQuantity(stockQuantity)
                            .weightGrams(weightGrams)
                            .ingredients(ingredients)
                            .origin(origin)
                            .isHalal(true)
                            .isActive(true)
                            .isFeatured(featured)
                            .category(category)
                            .images(new ArrayList<>(images))
                            .build();
                    productRepository.save(product);
                    log.info("Created portfolio product {}", sku);
                });
    }
}
