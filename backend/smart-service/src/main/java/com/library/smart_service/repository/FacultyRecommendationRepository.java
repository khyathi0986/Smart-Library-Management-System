
package com.library.smart_service.repository;

import com.library.smart_service.model.FacultyRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacultyRecommendationRepository
        extends JpaRepository<FacultyRecommendation, Long> {

    List<FacultyRecommendation> findAllByOrderByCreatedAtDesc();

    List<FacultyRecommendation>
        findByFacultyIdOrderByCreatedAtDesc(Long facultyId);
}
