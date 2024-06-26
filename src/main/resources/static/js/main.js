'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let nickname = null;
let fullname = null;
let selectedUserId = null;

function connect(event) {
    nickname = document.querySelector('#nickname').value.trim();
    fullname = document.querySelector('#fullname').value.trim();
    if(nickname && fullname) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError)
    }
    document.querySelector('#connected-user-fullname').textContent = fullname;
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    //register the connected user
    stompClient.send('/app/user.addUser',
        {},
        JSON.stringify({
            nickname: nickname,
            fullname: fullname,
            status: 'ONLINE'
        }))
    //find and display the connected user
    findAndDisplayConnectedUser().then();
}

async function findAndDisplayConnectedUser() {
    const connectedUserResponse = await fetch("/users");
    let connectedUsers = await connectedUserResponse.json();
    //Filter a connected user out of the list of connectedUsers in chat room
    connectedUsers = connectedUsers.filter(user => user.nickname !== nickname);
    const connectedUserList = document.getElementById('connectedUsers');
    connectedUserList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserELement(user, connectedUserList);
        if(connectedUsers.index(user) < connectedUsers.length - 1) {
            //if the user haven't reached the last element
            //add a separator
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUserList.appendChild(separator);
        }
    })
}

function appendUserELement(user, connectedUserList) {
    //Create a space to tell new user participate
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickname;

    //User picture
    const userImage = document.createElement('img');
    userImage.src = '../img/images.jpg';
    userImage.alt = user.fullname;

    //User full name
    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    //Alert user when new message come
    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick)

    connectedUserList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayChatMessage(chat.senderId, chat.content);
    })
    chatArea.scrollTop = chatArea.scrollHeight;
}

function displayChatMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if(senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(messageContainer);
    chatArea.appendChild(messageContainer);
}

function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname,
            recipientId: selectedUserId,
            content: messageContent,
            timestamp: new Date()
        };
        stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
        displayChatMessage(nickname, messageContent);
    }
    event.preventDefault();
}


function onError() {

}

async function onMessageReceived(payload) {
    await findAndDisplayConnectedUser();

    const message = JSON.parse(payload.body);
    if(selectedUserId && selectedUserId === message.senderId) {
        displayChatMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if(selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add("active");
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if(notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function onLogout() {
    stompClient.send('/app/user.disconnectUser', {},
        JSON.stringify({
        nickname: nickname,
        fullname: fullname,
        status: 'OFFLINE'
    }));
    window.location.reload();
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);

window.onbeforeunload = () => onLogout();