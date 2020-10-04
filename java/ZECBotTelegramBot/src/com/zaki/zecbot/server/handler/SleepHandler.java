package com.zaki.zecbot.server.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.zaki.zecbot.server.util.Utils;

import java.io.IOException;
import java.io.OutputStream;

public class SleepHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange t) throws IOException {
        System.out.println("Sleeping");
        Utils.sleep(5000);

        String response = "";
        t.getResponseHeaders().add("Access-Control-Allow-Origin", "web.telegram.org");
        t.getResponseHeaders().add("Access-Control-Allow-Headers", "GET");
        t.sendResponseHeaders(200, response.getBytes().length);
        try (OutputStream os = t.getResponseBody()) {
            os.write(response.getBytes());
        }
    }
}
