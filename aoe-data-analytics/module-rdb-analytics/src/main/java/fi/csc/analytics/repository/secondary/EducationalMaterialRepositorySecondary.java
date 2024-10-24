package fi.csc.analytics.repository.secondary;

import fi.csc.analytics.entity.EducationalMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Repository
@Transactional(readOnly = true, transactionManager = "transactionManagerSecondary")
public interface EducationalMaterialRepositorySecondary extends JpaRepository<EducationalMaterial, Long> {

    @Query("""
        select count(em) from EducationalMaterial em
        join em.educationalLevels el
        where el.educationalLevelKey = :educationalLevelKey""")
    Long countByEducationalLevelKey(String educationalLevelKey);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.educationalLevels el
        where el.educationalLevelKey = :educationalLevelKey
        and em.publishedAt >= :startDate
        and em.publishedAt < :endDate""")
    Long countByEducationalLevelBetweenPublishDates(
        @Param("educationalLevelKey") String educationalLevelKey,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.educationalLevels el
        where el.educationalLevelKey = :educationalLevelKey
        and em.expires < :expiresDate""")
    Long countByEducationalLevelExpiresBefore(
        @Param("educationalLevelKey") String educationalLevelKey,
        @Param("expiresDate") OffsetDateTime expiresDate);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.alignmentObjects ao
        where ao.objectKey = :objectKey""")
    Long countByEducationalSubjectKey(String objectKey);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.alignmentObjects ao
        where ao.objectKey = :objectKey
        and em.publishedAt >= :startDate
        and em.publishedAt < :endDate""")
    Long countByEducationalSubjectBetweenPublishDates(
        @Param("objectKey") String objectKey,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.authors a
        where a.organizationKey = :organizationKey""")
    Long countByOrganizationKey(@Param("organizationKey") String organizationKey);

    @Query("""
        select count(em) from EducationalMaterial em
        join em.authors a
        where a.organizationKey = :organizationKey
        and em.publishedAt >= :startDate
        and em.publishedAt < :endDate""")
    Long countByOrganizationBetweenPublishDates(
        @Param("organizationKey") String organizationKey,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate);

}
