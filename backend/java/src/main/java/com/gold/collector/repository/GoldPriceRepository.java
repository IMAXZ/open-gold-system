package com.gold.collector.repository;

import com.gold.collector.entity.GoldPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * @author max
 */
@Repository
public interface GoldPriceRepository extends JpaRepository<GoldPrice, Long> {
    /**
     * 查找最新的记录（按自增主键 ID 降序）
     */
    Optional<GoldPrice> findTopByOrderByIdDesc();

    /**
     * 查找最新的 N 条记录（按 ID 降序，N<=100）
     */
    List<GoldPrice> findTop100ByOrderByIdDesc();

    List<GoldPrice> findByCreatedDateBetweenOrderByIdAsc(LocalDate createdDateAfter, LocalDate createdDateBefore);
}