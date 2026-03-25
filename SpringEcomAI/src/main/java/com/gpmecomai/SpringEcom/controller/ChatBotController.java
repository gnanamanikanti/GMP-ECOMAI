package com.gpmecomai.SpringEcom.controller;

import com.gpmecomai.SpringEcom.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatBotController {

    @Autowired
    private ChatBotService chatBotService;

    @GetMapping("/ask")
    public ResponseEntity<String> askBot(@RequestParam String message){

        String response = chatBotService.getBotResponse(message);
        return ResponseEntity.ok(response);
    }
}
