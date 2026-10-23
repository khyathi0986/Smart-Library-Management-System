package com.library.smart_service.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="notifications", indexes={@Index(name="idx_notification_user",columnList="userId")})
public class LibraryNotification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long userId; @Column(nullable=false) private String type;
 @Column(nullable=false,length=1200) private String message; @Column(name="is_read",nullable=false) private boolean read=false;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public LibraryNotification(){}
 public Long getId(){return id;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
 public String getType(){return type;} public void setType(String v){type=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public boolean isRead(){return read;} public void setRead(boolean v){read=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}
