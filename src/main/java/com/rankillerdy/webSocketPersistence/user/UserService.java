package com.rankillerdy.webSocketPersistence.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.rankillerdy.webSocketPersistence.user.Status.OFFLINE;
import static com.rankillerdy.webSocketPersistence.user.Status.ONLINE;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;

    //Save user
    public void save(User user) {
        user.setStatus(ONLINE);
        repository.save(user);
    }

    //Disconnect user
    public void disconnect(User user) {
        var storedUser = repository.findById(user.getNickName()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(OFFLINE);
            repository.save(storedUser);
        }
    }

    //return connected users from the network
    public List<User> findConnectedUsers() {
        return repository.findAllByStatus(ONLINE);
    }
}
