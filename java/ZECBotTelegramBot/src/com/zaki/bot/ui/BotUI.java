package com.zaki.bot.ui;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class BotUI extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception {

        ServerController controller = new ServerController();

        primaryStage.setTitle("Zec BOT farmer");
        Button startBtn = new Button();
        startBtn.setText("Start");
        startBtn.setOnAction(event -> controller.start());
        startBtn.setTranslateX(-50);

        Button stopBtn = new Button();
        stopBtn.setText("Stop");
        stopBtn.setOnAction(event -> controller.stop());
        stopBtn.setTranslateX(50);

        StackPane root = new StackPane();
        root.getChildren().add(startBtn);
        root.getChildren().add(stopBtn);
        primaryStage.setScene(new Scene(root, 300, 250));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
