package com.library.smart_service.controller;

import com.library.smart_service.dto.*;
import com.library.smart_service.model.*;
import com.library.smart_service.service.SmartService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/smart")
public class SmartController {

    private final SmartService service;

    public SmartController(SmartService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public String health() { return "Smart Service is running"; }

    @PostMapping("/feedback")
    public Feedback addFeedback(@Valid @RequestBody FeedbackRequest r) { return service.addFeedback(r); }

    @GetMapping("/feedback")
    public List<Feedback> allFeedback() { return service.allFeedback(); }

    @GetMapping("/feedback/user/{userId}")
    public List<Feedback> userFeedback(@PathVariable Long userId) { return service.userFeedback(userId); }

    @PutMapping("/feedback/{id}")
    public Feedback updateFeedback(@PathVariable Long id, @Valid @RequestBody FeedbackRequest r) {
        return service.updateFeedback(id, r);
    }

    @DeleteMapping("/feedback/{id}")
    public Map<String, String> deleteFeedback(@PathVariable Long id) {
        service.deleteFeedback(id);
        return Map.of("message", "Feedback deleted");
    }

    @GetMapping("/recommendations/{userId}")
    public Map<String, Object> recommendations(@PathVariable Long userId) { return service.recommendations(userId); }

    @PostMapping("/faculty-recommendations")
    public FacultyRecommendation addFacultyRecommendation(@Valid @RequestBody FacultyRecommendationRequest request) {
        return service.addFacultyRecommendation(request);
    }

    @GetMapping("/faculty-recommendations")
    public List<FacultyRecommendation> allFacultyRecommendations() {
        return service.allFacultyRecommendations();
    }

    @GetMapping("/faculty-recommendations/faculty/{facultyId}")
    public List<FacultyRecommendation> facultyRecommendationsByFaculty(@PathVariable Long facultyId) {
        return service.facultyRecommendationsByFaculty(facultyId);
    }

    @PostMapping("/notifications")
    public LibraryNotification addNotification(@Valid @RequestBody NotificationRequest r) { return service.addNotification(r); }

    @GetMapping("/notifications/user/{userId}")
    public List<LibraryNotification> userNotifications(@PathVariable Long userId) { return service.userNotifications(userId); }

    @GetMapping("/notifications/user/{userId}/unread")
    public List<LibraryNotification> unreadNotifications(@PathVariable Long userId) { return service.unreadNotifications(userId); }

    @PatchMapping("/notifications/{id}/read")
    public LibraryNotification markRead(@PathVariable Long id) { return service.markRead(id); }

    @GetMapping("/insights/{userId}")
    public Map<String, Object> insights(@PathVariable Long userId) { return service.insights(userId); }
}
