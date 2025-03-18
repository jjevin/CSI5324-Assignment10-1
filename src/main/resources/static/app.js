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

    updateVisibility(true); // unide information on connect.
};

function sendStatusUpdate(status) {
    var username = document.getElementById("username").value.trim();

    if (username !== "") {
        var statusMessage = {
            sender: username,
            body: "",
            status: status
        };

        if (status == "Do Not Disturb") {
            $("#post-info, #message-info").hide();
        } else {
            $("#post-info, #message-info").show();
        }

        stompClient.publish({
            destination: "/app/status",
            body: JSON.stringify(statusMessage),
        });
    }
}

// method for hiding/unhiding information based on connection status.
function updateVisibility(connected) {
    if (connected) {
        $("#status-info, #message-info, #online, #dnd").show();
        $("#connect").hide();
        $("#disconnect").show();
    } else {
        $("#disconnect").hide();
        $("#status-info, #message-info").hide();
        $("#connect").show();
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
    setStatus("Online");
}

function disconnect() {
    var username = document.getElementById("username").value.trim();
    
    if (username !== "") {
        usersStatusMap[username] = "Offline"; 
        updateStatusList([]);
        sendStatusUpdate("Offline");
    }

    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");

    updateVisibility(false); // re-hide information.
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
    let statusColor = message.status === "Online" ? "#5cb85c" : message.status === "Do Not Disturb" ? "#f0ad4e" : "#6c757d";

    $("#posts").append(`
        <tr>
            <td>
                <span class="status-dot" style="background-color: ${statusColor};"></span>
                <b>${message.sender}:</b> ${message.body}
            </td>
        </tr>
    `);
}

let usersStatusMap = {};

function updateStatusList(statuses) {
    $("#statusList").html(""); // Clear existing list

    statuses.forEach((user) => {
        usersStatusMap[user.sender] = user.status;
    });

    Object.keys(usersStatusMap).forEach((username) => {
        let status = usersStatusMap[username] || "Offline";
        let statusColor = status === "Online" ? "#5cb85c" : status === "Do Not Disturb" ? "#f0ad4e" : "#6c757d";

        $("#statusList").append(`
            <li class="user-status" data-username="${username}">
                <span class="status-dot" style="background-color: ${statusColor};"></span>
                <b>${username}</b> - ${status}
            </li>
        `);
    });

    updatePostStatuses(statuses);
}

function updatePostStatuses(statuses) {
    Object.keys(usersStatusMap).forEach((username) => {
        let status = usersStatusMap[username] || "Offline";
        let statusColor = status === "Online" ? "#5cb85c" : status === "Do Not Disturb" ? "#f0ad4e" : "#6c757d";
        
        $("#posts tr").each(function () {
            let postText = $(this).find("b").text().replace(":", "").trim();
            if (postText === username) {
                $(this).find(".status-dot").css("background-color", statusColor);
            }
        });
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

    $("#status-info, #message-info, #online, #dnd, #disconnect").hide(); // set default to hide information until connected.
});
