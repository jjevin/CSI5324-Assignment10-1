package com.example.messagingstompwebsocket;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class MessageController {

	 private static final ConcurrentHashMap<String, String> userStatuses = new ConcurrentHashMap<>();

	@MessageMapping("/message")
	@SendTo("/topic/posts")
	public Message post(@Payload Message message) throws Exception {
        System.out.println("Received message: Sender = " + message.getSender() + ", Body = " + message.getBody());

		String status = userStatuses.getOrDefault(message.getSender(), "Online");

		return new Message(
            HtmlUtils.htmlEscape(message.getSender()),
            HtmlUtils.htmlEscape(message.getBody()),
			status
        );
    }

    @MessageMapping("/status")
    @SendTo("/topic/status")
    public List<Message> updateStatus(@Payload Message message) throws Exception {
        System.out.println("🔍 Updating status: " + message.getSender() + " is now " + message.getStatus());

        userStatuses.put(message.getSender(), message.getStatus());

        return userStatuses.entrySet()
                .stream()
                .map(entry -> new Message(entry.getKey(), "", entry.getValue()))
                .collect(Collectors.toList());
    }

}
