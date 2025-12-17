package citu.stde.security;

import citu.stde.entity.User;
import citu.stde.entity.UserType;
import citu.stde.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // Extract user information from Google
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub"); // Google's unique user ID
        
        // DEBUG: Print ALL cookies
        System.out.println("=== ALL COOKIES ===");
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                System.out.println("Cookie: " + cookie.getName() + " = " + cookie.getValue());
            }
        } else {
            System.out.println("NO COOKIES FOUND!");
        }
        
        // Get login type and mode from cookies
        String loginPage = "student"; // Default
        String oauthMode = "login"; // Default mode is login
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("oauthLoginType".equals(cookie.getName())) {
                    loginPage = cookie.getValue();
                    System.out.println("FOUND oauthLoginType cookie: " + loginPage);
                    // Delete the cookie after reading
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                } else if ("oauthMode".equals(cookie.getName())) {
                    oauthMode = cookie.getValue();
                    System.out.println("FOUND oauthMode cookie: " + oauthMode);
                    // Delete the cookie after reading
                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                }
            }
        }
        
        System.out.println("=== OAUTH DEBUG ===");
        System.out.println("Email: " + email);
        System.out.println("Google ID (sub): " + googleId);
        System.out.println("Login page from cookie: " + loginPage);
        System.out.println("OAuth mode: " + oauthMode);
        
        // ========== LINK MODE: Check if Google account is already used ==========
        if ("link".equals(oauthMode)) {
            // Check if this Google ID is already linked to ANY user
            Optional<User> userWithGoogleId = userRepository.findByGoogleId(googleId);
            if (userWithGoogleId.isPresent()) {
                System.out.println("BLOCKING: Google account already linked to user: " + userWithGoogleId.get().getEmail());
                String errorRedirect = "http://localhost:5173/auth/callback?error=" + 
                    URLEncoder.encode("This Google account is already connected to another account.", StandardCharsets.UTF_8);
                response.sendRedirect(errorRedirect);
                return;
            }
            
            // Also check if this Google email already exists as a different account
            Optional<User> userWithEmail = userRepository.findByEmail(email);
            if (userWithEmail.isPresent()) {
                // Email exists - this is the account to link to, proceed with login flow
                // The frontend will handle merging the accounts
                System.out.println("Google email already exists, proceeding to link");
            }
        }
        
        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        
        if (existingUser.isPresent()) {
            user = existingUser.get();
            
            // ROLE VALIDATION (only for normal login, not link mode)
            if (!"link".equals(oauthMode)) {
                String userRole = user.getUserType().name();
                
                System.out.println("User role from DB: " + userRole);
                System.out.println("Expected login page: " + loginPage);
                
                if (loginPage.equals("student") && !userRole.equals("STUDENT")) {
                    System.out.println("BLOCKING: TEACHER trying to use student login");
                    String errorRedirect = "http://localhost:5173/login/student?error=" + 
                        URLEncoder.encode("This account is registered as a teacher. Please use the teacher login page.", StandardCharsets.UTF_8);
                    response.sendRedirect(errorRedirect);
                    return;
                } else if (loginPage.equals("teacher") && !userRole.equals("TEACHER")) {
                    System.out.println("BLOCKING: STUDENT trying to use teacher login");
                    String errorRedirect = "http://localhost:5173/login/teacher?error=" + 
                        URLEncoder.encode("This account is registered as a student. Please use the student login page.", StandardCharsets.UTF_8);
                    response.sendRedirect(errorRedirect);
                    return;
                }
                
                System.out.println("Role validation PASSED");
            }
            
            // Update googleId if not already set (for accounts that existed before this feature)
            if (user.getGoogleId() == null && googleId != null) {
                user.setGoogleId(googleId);
                user = userRepository.save(user);
                System.out.println("Updated existing user with Google ID");
            }
            
        } else {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setFirstname(firstName);
            user.setLastname(lastName);
            user.setPassword("");
            user.setGoogleId(googleId); // Store Google ID for new users
            
            if (loginPage.equals("teacher")) {
                user.setUserType(UserType.TEACHER);
            } else {
                user.setUserType(UserType.STUDENT);
            }
            
            System.out.println("Creating NEW user with role: " + user.getUserType() + " and Google ID: " + googleId);
            user = userRepository.save(user);
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getId().toString(),
            user.getUserType().name()
        );
        
        // Redirect to frontend
        String redirectUrl = String.format(
            "http://localhost:5173/auth/callback?token=%s&userId=%s&userType=%s&firstname=%s&lastname=%s&email=%s&avatarUrl=%s",
            token,
            user.getId().toString(),
            user.getUserType().name(),
            URLEncoder.encode(user.getFirstname(), StandardCharsets.UTF_8),
            URLEncoder.encode(user.getLastname(), StandardCharsets.UTF_8),
            URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8),
            URLEncoder.encode(picture != null ? picture : "", StandardCharsets.UTF_8)
        );
        
        System.out.println("Redirecting to: " + redirectUrl);
        System.out.println("=== END DEBUG ===");
        
        response.sendRedirect(redirectUrl);
    }
}