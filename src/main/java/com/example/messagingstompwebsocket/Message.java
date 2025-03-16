package com.example.messagingstompwebsocket;

import java.util.UUID;

public class Message {

    private String body;
	private String name = UUID.randomUUID().toString();

	public Message() {
	}

    public Message(String body) {
        this.body = body;
    }

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}
}
