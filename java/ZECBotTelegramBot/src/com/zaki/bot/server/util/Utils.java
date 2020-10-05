package com.zaki.bot.server.util;

public class Utils {

    public static void noop() {}

    public static void sleep(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Utils.noop();
        }
    }
}
