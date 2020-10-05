package com.zaki.bot.server.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;

public abstract class Handler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {
        String response = handleChild(t);
        t.getResponseHeaders().add("Access-Control-Allow-Origin", "web.telegram.org");
        t.getResponseHeaders().add("Access-Control-Allow-Headers", "GET");
        t.sendResponseHeaders(200, response.getBytes().length);
        try (OutputStream os = t.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    public abstract String handleChild(HttpExchange t);
}
