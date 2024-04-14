package com.rankillerdy.webSocketPersistence.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository repository;

    public Optional<String> getChatRoomId(
            String senderId,
            String recipientId,
            boolean createNewRoomIfNotExists
    ) {
        return repository.findBySenderIdAndRecipientId(senderId, recipientId)
                .map(Chatroom::getChatId)
                .or(() -> {
                    if(createNewRoomIfNotExists) {
                        var chatId = createChatId(senderId, recipientId);
                        return Optional.of(chatId);
                    }
                    return Optional.empty();
                });
    }

    private String createChatId(String senderId, String recipientId) {
        var chatId = String.format("%s_%s", senderId, recipientId); // Example: RankillerDY_FrosterDY
        Chatroom senderRecipient = Chatroom.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .chatId(chatId)
                .build();

        Chatroom recipientSender = Chatroom.builder()
                .senderId(recipientId)
                .recipientId(senderId)
                .chatId(chatId)
                .build();
        repository.save(senderRecipient);
        repository.save(recipientSender);
        return chatId;
    }
}
