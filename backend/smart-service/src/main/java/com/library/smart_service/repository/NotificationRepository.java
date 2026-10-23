package com.library.smart_service.repository;
import com.library.smart_service.model.LibraryNotification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface NotificationRepository extends JpaRepository<LibraryNotification,Long>{ List<LibraryNotification> findByUserIdOrderByCreatedAtDesc(Long userId); List<LibraryNotification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId); }
