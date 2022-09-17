package com.orenlee.imagemani.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {

    @RequestMapping({ "/login", "/signup", "/images", "/verify-account", "/change-password" })
    public String index() {
        return "forward:/index.html";
    }
}