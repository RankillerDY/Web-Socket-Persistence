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
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    //register the connected user
    stompClient.send('app/user.addUser',
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
            //if the user haven't reach the last element
            //add a separator
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUserList.appendChild(separator);
        }
    })
}

function appendUserELement(user, connectedUserList) {

}

function onError() {

}

function onMessageReceived() {

}
usernameForm.addEventListener('submit', connect, true);