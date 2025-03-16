const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/gs-guide-websocket'
});

stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);
    
    stompClient.subscribe('/topic/posts', (post) => {
        showPost(JSON.parse(post.body));
    });

    stompClient.subscribe('/topic/status', (statusUpdate) => {
        updateStatusList(JSON.parse(statusUpdate.body));
    });

    sendStatusUpdate("Online"); 
};

function sendStatusUpdate(status) {
    var username = document.getElementById("username").value.trim();

    if (username !== "") {
        var statusMessage = {
            sender: username,
            body: "",
            status: status
        };

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(statusMessage),
        });
    }
}

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#posts").html("");
}

function connect() {
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
}

function sendMessage() {
    var username = document.getElementById("username").value.trim();
    var messageContent = document.getElementById("body").value.trim();

    if (username === "") {
        alert("Please enter a username before sending messages.");
        return;
    }

    if (messageContent !== "") {
        var userStatus = $("#statusList").find("b:contains('" + username + "')").parent().text().split(": ")[1] || "Online";
        
        var chatMessage = {
            sender: username,
            body: messageContent,
            status: userStatus
        };

        stompClient.publish({
            destination: "/app/message",
            body: JSON.stringify(chatMessage),
        });

        document.getElementById("body").value = "";
    }
}

function showPost(message) {
    if (message.status !== "Do Not Disturb") {
        $("#posts").append("<tr><td><b>" + message.sender + ":</b> " + message.body + "</td></tr>");
    }
}

function updateStatusList(statuses) {
    $("#statusList").html(""); // Clear existing list
    statuses.forEach((user) => {
        $("#statusList").append("<tr><td><b>" + user.sender + "</b>: " + user.status + "</td></tr>");
    });
}

function setStatus(status) {
    sendStatusUpdate(status);
}

$(function () {
    $("form").on('submit', (e) => e.preventDefault());
    $("#connect").click(() => connect());
    $("#disconnect").click(() => disconnect());
    $("#send").click(() => sendMessage());
    $("#online").click(() => setStatus("Online"));
    $("#dnd").click(() => setStatus("Do Not Disturb"));
});
