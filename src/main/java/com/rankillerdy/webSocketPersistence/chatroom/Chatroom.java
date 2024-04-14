package com.rankillerdy.webSocketPersistence.chatroom;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Chatroom {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String recipientId;
}
