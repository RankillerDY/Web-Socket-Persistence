package com.rankillerdy.webSocketPersistence.chatroom;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<Chatroom, String> {
    Optional<Chatroom> findBySenderIdAndRecipientId(String senderId, String recipientId);

}
