package citu.stde.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/oauth2")
public class OAuth2Controller {

    @GetMapping("/login/{loginType}")
    public RedirectView initiateOAuth2Login(
            @PathVariable String loginType,
            HttpServletResponse response) {
        
        // Store login type in a cookie that will survive the OAuth redirect
        Cookie loginTypeCookie = new Cookie("oauthLoginType", loginType);
        loginTypeCookie.setPath("/");
        loginTypeCookie.setMaxAge(300); // 5 minutes (enough for OAuth flow)
        loginTypeCookie.setHttpOnly(true);
        loginTypeCookie.setSecure(false); // Set to true in production with HTTPS
        response.addCookie(loginTypeCookie);
        
        System.out.println("=== Setting OAuth login type cookie: " + loginType + " ===");
        
        // Redirect to Spring Security's OAuth2 endpoint
        return new RedirectView("/oauth2/authorization/google");
    }

    /**
     * Endpoint for LINKING a Google account to an existing local account.
     * This is different from login - it checks if the Google account is already in use.
     */
    @GetMapping("/link/{loginType}")
    public RedirectView initiateOAuth2Link(
            @PathVariable String loginType,
            HttpServletResponse response) {
        
        // Store login type in a cookie
        Cookie loginTypeCookie = new Cookie("oauthLoginType", loginType);
        loginTypeCookie.setPath("/");
        loginTypeCookie.setMaxAge(300);
        loginTypeCookie.setHttpOnly(true);
        loginTypeCookie.setSecure(false);
        response.addCookie(loginTypeCookie);
        
        // Store mode as "link" to differentiate from normal login
        Cookie modeCookie = new Cookie("oauthMode", "link");
        modeCookie.setPath("/");
        modeCookie.setMaxAge(300);
        modeCookie.setHttpOnly(true);
        modeCookie.setSecure(false);
        response.addCookie(modeCookie);
        
        System.out.println("=== Setting OAuth LINK mode for: " + loginType + " ===");
        
        return new RedirectView("/oauth2/authorization/google");
    }
}