package com.library.smart_service.service;

import com.library.smart_service.dto.*;
import com.library.smart_service.model.*;
import com.library.smart_service.repository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmartService {

    private final FeedbackRepository feedbacks;
    private final NotificationRepository notifications;
    private final FacultyRecommendationRepository facultyRecommendations;
    private final RestClient restClient;

    public SmartService(
            FeedbackRepository f,
            NotificationRepository n,
            FacultyRecommendationRepository fr,
            RestClient.Builder restClientBuilder,
            @Value("${services.book-service.url:http://localhost:8082}") String bookServiceUrl) {
        this.feedbacks = f;
        this.notifications = n;
        this.facultyRecommendations = fr;
        this.restClient = restClientBuilder.baseUrl(bookServiceUrl).build();
    }

    @Transactional
    public Feedback addFeedback(FeedbackRequest r) {
        Feedback f = new Feedback();
        f.setUserId(r.userId());
        f.setBookId(r.bookId());
        f.setBookTitle(r.bookTitle().trim());
        f.setCategory(r.category().trim());
        f.setRating(r.rating());
        f.setComment(r.comment());
        return feedbacks.save(f);
    }

    public List<Feedback> allFeedback() {
        return feedbacks.findAll();
    }

    public List<Feedback> userFeedback(Long userId) {
        return feedbacks.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Feedback updateFeedback(Long id, FeedbackRequest r) {
        Feedback f = feedbacks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));
        f.setUserId(r.userId());
        f.setBookId(r.bookId());
        f.setBookTitle(r.bookTitle().trim());
        f.setCategory(r.category().trim());
        f.setRating(r.rating());
        f.setComment(r.comment());
        return feedbacks.save(f);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbacks.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found");
        }
        feedbacks.deleteById(id);
    }

    // Student's personalized recommendations based on their submitted feedback.
    public Map<String, Object> recommendations(Long userId) {
        List<Feedback> mine = feedbacks.findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, Double> categoryScores = mine.stream().collect(Collectors.groupingBy(
                f -> f.getCategory().toLowerCase(Locale.ROOT), Collectors.averagingInt(Feedback::getRating)));
        List<String> preferredCategories = categoryScores.entrySet().stream()
                .filter(e -> e.getValue() >= 3.5)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey).toList();
        Set<Long> ratedBookIds = mine.stream().map(Feedback::getBookId).collect(Collectors.toSet());
        List<Map<String, Object>> resultBooks = new ArrayList<>();

        try {
            List<Map<String, Object>> catalogue = restClient.get().uri("/api/books")
                    .retrieve().body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            if (catalogue != null) {
                for (Map<String, Object> book : catalogue) {
                    Object idObject = book.get("id");
                    if (!(idObject instanceof Number)) continue;
                    Long bookId = ((Number) idObject).longValue();
                    String title = Objects.toString(book.get("title"), "");
                    String author = Objects.toString(book.get("author"), "");
                    String category = Objects.toString(book.get("category"), "");
                    boolean active = Boolean.TRUE.equals(book.get("active"));
                    Object copiesObject = book.get("availableCopies");
                    int availableCopies = copiesObject instanceof Number ? ((Number) copiesObject).intValue() : 0;
                    if (!active || availableCopies <= 0 || ratedBookIds.contains(bookId)) continue;
                    boolean preferred = preferredCategories.stream().anyMatch(c -> c.equalsIgnoreCase(category));
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("bookId", bookId);
                    item.put("title", title);
                    item.put("author", author);
                    item.put("category", category);
                    item.put("availableCopies", availableCopies);
                    item.put("reason", preferred ? "Matches a category you rated positively" : "Available catalogue book you have not rated");
                    resultBooks.add(item);
                }
            }
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not retrieve books from Book Service", ex);
        }

        resultBooks.sort(Comparator.comparingInt(book -> preferredCategories.stream().anyMatch(c ->
                c.equalsIgnoreCase(Objects.toString(book.get("category"), ""))) ? 0 : 1));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", userId);
        result.put("preferredCategories", preferredCategories);
        result.put("recommendations", resultBooks.stream().limit(10).toList());
        result.put("note", "Recommendations use your feedback and available catalogue books.");
        return result;
    }

    // Faculty recommendations are stored separately from student AI recommendations.
    @Transactional
    public FacultyRecommendation addFacultyRecommendation(FacultyRecommendationRequest r) {
        Map<String, Object> book = getBookFromCatalogue(r.bookId());
        if (book == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found in the catalogue");
        }
        if (!Boolean.TRUE.equals(book.get("active"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This book is not active in the catalogue");
        }

        FacultyRecommendation item = new FacultyRecommendation();
        item.setFacultyId(r.facultyId());
        item.setFacultyName(r.facultyName().trim());
        item.setBookId(r.bookId());
        item.setBookTitle(Objects.toString(book.get("title"), r.bookTitle()).trim());
        item.setAuthor(Objects.toString(book.get("author"), r.author()));
        item.setCategory(Objects.toString(book.get("category"), r.category()));
        item.setReason(r.reason().trim());
        return facultyRecommendations.save(item);
    }

    private Map<String, Object> getBookFromCatalogue(Long bookId) {
        try {
            List<Map<String, Object>> catalogue = restClient.get().uri("/api/books")
                    .retrieve().body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            if (catalogue == null) return null;
            return catalogue.stream().filter(b -> b.get("id") instanceof Number
                    && ((Number) b.get("id")).longValue() == bookId).findFirst().orElse(null);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not validate book with Book Service", ex);
        }
    }

    public List<FacultyRecommendation> allFacultyRecommendations() {
        return facultyRecommendations.findAllByOrderByCreatedAtDesc();
    }

    public List<FacultyRecommendation> facultyRecommendationsByFaculty(Long facultyId) {
        return facultyRecommendations.findByFacultyIdOrderByCreatedAtDesc(facultyId);
    }

    @Transactional
    public LibraryNotification addNotification(NotificationRequest r) {
        LibraryNotification n = new LibraryNotification();
        n.setUserId(r.userId());
        n.setType(r.type().trim().toUpperCase(Locale.ROOT));
        n.setMessage(r.message().trim());
        return notifications.save(n);
    }

    public List<LibraryNotification> userNotifications(Long userId) {
        return notifications.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<LibraryNotification> unreadNotifications(Long userId) {
        return notifications.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public LibraryNotification markRead(Long id) {
        LibraryNotification n = notifications.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setRead(true);
        return notifications.save(n);
    }

    public Map<String, Object> insights(Long userId) {
        List<Feedback> list = feedbacks.findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, Long> byCategory = list.stream().collect(Collectors.groupingBy(Feedback::getCategory, Collectors.counting()));
        double averageRating = list.stream().mapToInt(Feedback::getRating).average().orElse(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", userId);
        result.put("feedbackCount", list.size());
        result.put("averageRatingGiven", Math.round(averageRating * 100.0) / 100.0);
        result.put("categoryActivity", byCategory);
        result.put("message", list.isEmpty() ? "Rate books to start building your reading insights." :
                "Insights are based on your submitted book ratings and feedback.");
        return result;
    }
}
