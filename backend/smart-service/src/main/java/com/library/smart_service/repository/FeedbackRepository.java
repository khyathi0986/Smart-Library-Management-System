package com.library.smart_service.repository;
import com.library.smart_service.model.Feedback; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface FeedbackRepository extends JpaRepository<Feedback,Long>{ List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId); List<Feedback> findByCategoryIgnoreCaseAndRatingGreaterThanEqual(String category,int rating); }
