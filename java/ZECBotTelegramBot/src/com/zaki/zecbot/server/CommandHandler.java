package com.zaki.zecbot.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.zaki.zecbot.server.util.Utils;
import javafx.util.Pair;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class CommandHandler implements HttpHandler {

    private static final List<Pair<String, Integer>> operations = new ArrayList<>();

    private static int nextOperationIdx = 0;

    static {
        operations.add(new Pair<>("closeEmoji", 5000));
        operations.add(new Pair<>("goToChannelOrGroup", 5000));
        operations.add(new Pair<>("joinChannelOrGroup", 5000));
        operations.add(new Pair<>("zecChannel", 5000));
        operations.add(new Pair<>("joined", 5000));
    }

    @Override
    public void handle(HttpExchange t) throws IOException {
        Pair<String, Integer> operation = getNextOperation();
        sleep(operation.getValue());

        String response = operation.getKey();
        t.getResponseHeaders().add("Access-Control-Allow-Origin", "web.telegram.org");
        t.getResponseHeaders().add("Access-Control-Allow-Headers", "GET");
        t.sendResponseHeaders(200, response.getBytes().length);
        try (OutputStream os = t.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    private void sleep(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Utils.noop();
        }
    }

    private Pair getNextOperation() {

        Pair op = operations.get(nextOperationIdx);
        nextOperationIdx++;
        if (nextOperationIdx == operations.size()) {
            nextOperationIdx = 0;
        }

        System.out.println("Next operation is: " + op.getKey());

        return op;
    }

    public void stop() {
        nextOperationIdx = 0;
    }
}
