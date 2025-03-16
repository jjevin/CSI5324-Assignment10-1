package com.example.messagingstompwebsocket;

public class Message {

    private String sender;
	private String body;
    private String status;

	public Message() {
	}

    public Message(String sender, String body, String status) {
        this.sender = sender;
        this.body = body;
        this.status = status;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
