package com.zaki.bot.server.handler.impl.zecbot;

import com.sun.net.httpserver.HttpExchange;
import com.zaki.bot.server.handler.Handler;
import com.zaki.bot.server.util.Utils;
import javafx.util.Pair;

import java.util.ArrayList;
import java.util.List;

// TODO make graph of operations instead of list
// TODO start visiting sites if no current adds when joining chats are available
// TODO start messagig bots when no other task is available
public class CommandHandler extends Handler {

    private static final List<Pair<String, Integer>> operations = new ArrayList<>();

    private static int nextOperationIdx = 0;

    static {
        operations.add(new Pair<>("goToChannelOrGroup", 5000));
        operations.add(new Pair<>("joinChannelOrGroup", 5000));
        operations.add(new Pair<>("zecChannel", 5000));
        operations.add(new Pair<>("joined", 5000));
    }

    @Override
    public String handleChild(HttpExchange t) {
        Pair<String, Integer> operation = getNextOperation();
        Utils.sleep(operation.getValue());

        return operation.getKey();
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
