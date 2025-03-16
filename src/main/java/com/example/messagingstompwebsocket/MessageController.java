package com.example.messagingstompwebsocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class MessageController {

	@MessageMapping("/message")
	@SendTo("/topic/posts")
	public Post post(Message message) throws Exception {
		return new Post(HtmlUtils.htmlEscape(message.getName()) + ": " + HtmlUtils.htmlEscape(message.getBody()));
	}

}
