package com.zaki.bot.server.handler.impl;

import com.sun.net.httpserver.HttpExchange;
import com.zaki.bot.server.handler.Handler;
import com.zaki.bot.server.util.Utils;

public class SleepHandler extends Handler {
    @Override
    public String handleChild(HttpExchange t) {

        int ms = 0;

        if (t.getRequestHeaders().get("Sleep-time") != null) {
            ms = Integer.parseInt(t.getRequestHeaders().get("Sleep-time").get(0));
        }

        if (ms != 0) {
            System.out.println("Sleeping for " + ms);
            Utils.sleep(ms);
        }
        return "SUCCESS";
    }
}
