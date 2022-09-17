package com.orenlee.imagemani.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ViewController {

    @RequestMapping({ "/login", "/signup", "/images", "/verify-account", "/change-password" })
    public String index() {
        return "forward:/index.html";
    }
}