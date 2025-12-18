package citu.stde.service;

import citu.stde.dto.EvaluationDTO;
import citu.stde.dto.EvaluationResponse;
import citu.stde.entity.Document;
import citu.stde.entity.DocumentStatus;
import citu.stde.entity.Evaluation;
import citu.stde.entity.User;
import citu.stde.repository.DocumentRepository;
import citu.stde.repository.EvaluationRepository;
import citu.stde.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final ChatClient.Builder chatClientBuilder;
    private final DocumentRepository documentRepository;
    private final EvaluationRepository evaluationRepository;
    private final GoogleDriveService googleDriveService;
    private final ClassroomService classroomService; 
    private final UserRepository userRepository;
    private final AdminService adminService; 

    // ==========================================
    // DEV SETTINGS (Toggle here for testing)
    // ==========================================
    private final boolean ENABLE_TRUNCATION = false; // Set 'true' to save tokens
    private static final int HOURLY_LIMIT = 30;      // Dev limit increased to 30
    // ==========================================

    @Transactional
    public EvaluationDTO evaluateDocument(UUID documentId, UUID userId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        if (!doc.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to document");
        }

        checkAndIncrementUsage(userId);

        doc.setStatus(DocumentStatus.PROCESSING);
        documentRepository.save(doc);

        try {
            String fileContent = fetchFileContentFromDrive(doc);
            String currentHash = calculateHash(fileContent);
            doc.setContentHash(currentHash);
            documentRepository.save(doc);

            Optional<Evaluation> cachedEval = evaluationRepository
                .findTopByUserIdAndDocument_ContentHashOrderByCreatedAtDesc(userId, currentHash);

            if (cachedEval.isPresent()) {
                System.out.println("Duplicate content detected. Returning cached result.");
                return copyCachedEvaluation(cachedEval.get(), doc, userId);
            }

            String safeContent = truncateContent(fileContent);
            if (!isValidSoftwareTestingDocument(safeContent)) {
                throw new IllegalArgumentException("TYPE:INVALID_DOCUMENT|The uploaded document is not a Software Testing Document.");
            }

            Optional<Evaluation> existingEval = evaluationRepository.findByDocumentId(documentId);
            if (existingEval.isPresent()) {
                evaluationRepository.delete(existingEval.get());
                evaluationRepository.flush();
            }

            ChatClient chatClient = chatClientBuilder.build();
            String systemPrompt = """
                You are an EXPERT Software Test Document (STD) Evaluator. 
                
                CRITICAL INSTRUCTIONS:
                - NEVER give the same score for different documents
                - NEVER default to scores like 75, 77, 80, or 82
                - Actually COUNT the test cases, sections, and issues
                - Base scores on SPECIFIC EVIDENCE from the document
                
                === EVALUATION PROCESS ===
                
                STEP 1: COUNT these elements in the document:
                - Number of test cases
                - Number of sections (Test Plan, Prerequisites, Test Data, Expected Results, etc.)
                - Number of vague phrases ("verify it works", "check output", "should work")
                - Number of specific expected results ("displays 'Success' message", "returns 200 OK")
                
                STEP 2: CALCULATE scores based on counts:
                
                1. COMPLETENESS (0-100):
                   - 6+ sections with test cases = 90-100
                   - 4-5 sections = 75-89
                   - 2-3 sections = 50-74
                   - 1 section or less = 0-49
                
                2. CLARITY (0-100):
                   - 0 vague phrases, all specific = 90-100
                   - 1-3 vague phrases = 75-89
                   - 4-6 vague phrases = 50-74
                   - 7+ vague phrases = 0-49
                
                3. CONSISTENCY (0-100):
                   - Uniform format, numbered IDs = 90-100
                   - Minor format variations = 75-89
                   - Mixed formats = 50-74
                   - No consistent structure = 0-49
                
                4. VERIFICATION COVERAGE (0-100):
                   Count test scenario types present:
                   - Happy path tests
                   - Edge case tests
                   - Negative/error tests
                   - Boundary tests
                   - Performance tests
                   Score: (types found / 5) * 100, rounded
                
                OVERALL = Average of 4 scores, adjusted for major gaps
                
                IMPORTANT: Different documents MUST get DIFFERENT scores!
                - A simple 5-test-case document ≠ a comprehensive 50-test-case document
                - Count actual elements, don't guess
                
                Return ONLY this JSON (no markdown):
                {
                    "completenessScore": (Integer 0-100 based on section count),
                    "completenessFeedback": "Found X sections: [list them]. Missing: [list missing]",
                    "clarityScore": (Integer 0-100 based on vague phrase count),
                    "clarityFeedback": "Found X vague phrases: [quote them]. X specific results.",
                    "consistencyScore": (Integer 0-100 based on format analysis),
                    "consistencyFeedback": "Format analysis: [describe structure]",
                    "verificationScore": (Integer 0-100 based on test type count),
                    "verificationFeedback": "Test types found: [list]. Missing: [list]",
                    "overallScore": (Integer 0-100 - average adjusted for gaps),
                    "overallFeedback": "Summary with specific counts and recommendations"
                }
                """;

            EvaluationResponse aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(u -> u.text("Document Content:\n{content}").param("content", safeContent))
                    .call()
                    .entity(EvaluationResponse.class);

            if (aiResponse.completenessScore() == null) {
                throw new RuntimeException("AI returned null scores.");
            }

            Evaluation evaluation = mapToEntity(aiResponse, doc, userId);
            Evaluation savedEval = evaluationRepository.save(evaluation);

            doc.setStatus(DocumentStatus.COMPLETED);
            documentRepository.save(doc);

            // Record evaluation success
            adminService.logActivity("EVALUATE", doc.getUser().getEmail(), "Evaluated document: " + doc.getFilename());

            return mapToDTO(savedEval, doc.getFilename());

        } catch (Exception e) {
            doc.setStatus(DocumentStatus.FAILED);
            documentRepository.save(doc);
            
            String errorMsg = e.getMessage().toLowerCase();
            if (errorMsg.contains("429") || errorMsg.contains("rate limit")) {
                throw new RuntimeException("TYPE:RATE_LIMIT|AI is busy. Please wait 30 seconds.");
            }
            if (e.getMessage().startsWith("TYPE:")) {
                throw new RuntimeException(e.getMessage());
            }
            
            System.err.println("Backend Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("TYPE:SERVER_ERROR|Internal processing failed: " + e.getMessage());
        }
    }

    private void checkAndIncrementUsage(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Instant now = Instant.now();
        Instant windowStart = user.getEvaluationWindowStart();

        // Null Safety: Treat null count as 0
        int currentCount = user.getEvaluationCount() == null ? 0 : user.getEvaluationCount();

        if (windowStart == null || windowStart.plus(1, ChronoUnit.HOURS).isBefore(now)) {
            user.setEvaluationWindowStart(now);
            user.setEvaluationCount(0);
            windowStart = now;
            currentCount = 0;
        }

        if (currentCount >= HOURLY_LIMIT) {
            long minutesLeft = ChronoUnit.MINUTES.between(now, windowStart.plus(1, ChronoUnit.HOURS));
            throw new RuntimeException("TYPE:QUOTA_EXCEEDED|You have used all " + HOURLY_LIMIT + " analysis attempts for this hour. Resets in " + minutesLeft + " minutes.");
        }

        user.setEvaluationCount(currentCount + 1);
        userRepository.save(user);
    }

    public Map<String, Object> getUsageStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Instant now = Instant.now();
        Instant windowStart = user.getEvaluationWindowStart();
        
        int currentCount = user.getEvaluationCount() == null ? 0 : user.getEvaluationCount();

        if (windowStart == null || windowStart.plus(1, ChronoUnit.HOURS).isBefore(now)) {
            currentCount = 0;
            windowStart = now; 
        }

        long secondsRemaining = 0;
        if (windowStart != null) {
            Instant resetTime = windowStart.plus(1, ChronoUnit.HOURS);
            secondsRemaining = Math.max(0, ChronoUnit.SECONDS.between(now, resetTime));
        }

        // Returns the HOURLY_LIMIT constant, so frontend updates automatically
        return Map.of(
            "used", currentCount,
            "limit", HOURLY_LIMIT, 
            "remaining", Math.max(0, HOURLY_LIMIT - currentCount),
            "resetInSeconds", secondsRemaining
        );
    }

    private String calculateHash(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return null;
        }
    }

    private EvaluationDTO copyCachedEvaluation(Evaluation cached, Document currentDoc, UUID userId) {
        Evaluation newEval = Evaluation.builder()
                .document(currentDoc)
                .userId(userId)
                .completenessScore(cached.getCompletenessScore())
                .completenessFeedback(cached.getCompletenessFeedback())
                .clarityScore(cached.getClarityScore())
                .clarityFeedback(cached.getClarityFeedback())
                .consistencyScore(cached.getConsistencyScore())
                .consistencyFeedback(cached.getConsistencyFeedback())
                .verificationScore(cached.getVerificationScore())
                .verificationFeedback(cached.getVerificationFeedback())
                .overallScore(cached.getOverallScore())
                .overallFeedback(cached.getOverallFeedback() + " (Note: Result retrieved from cache as content is identical to previous submission.)")
                .build();

        Evaluation saved = evaluationRepository.save(newEval);
        currentDoc.setStatus(DocumentStatus.COMPLETED);
        documentRepository.save(currentDoc);
        
        // Record cached evaluation
        adminService.logActivity("EVALUATE_CACHE", currentDoc.getUser().getEmail(), "Returned cached evaluation for: " + currentDoc.getFilename());
        
        return mapToDTO(saved, currentDoc.getFilename());
    }

    @Transactional
    public EvaluationDTO overrideEvaluationScore(UUID documentId, UUID teacherId, Integer newScore) {
        if (newScore == null || newScore < 0 || newScore > 100) throw new IllegalArgumentException("Score must be between 0 and 100.");
        Document doc = documentRepository.findById(documentId).orElseThrow(() -> new IllegalArgumentException("Document not found."));
        UUID classId = doc.getClassroom() != null ? doc.getClassroom().getId() : null;
        if (classId == null) throw new SecurityException("Security check failed: Document is not linked to any class.");
        classroomService.verifyClassroomOwnership(classId, teacherId);
        Evaluation eval = evaluationRepository.findByDocumentId(documentId).orElseGet(() -> Evaluation.builder().document(doc).userId(doc.getUser().getId()).build());
        eval.setOverallScore(newScore);
        eval.setCompletenessScore(newScore);
        eval.setClarityScore(newScore);
        eval.setConsistencyScore(newScore);
        eval.setVerificationScore(newScore);
        eval.setOverallFeedback("Score manually overridden by Professor.");
        Evaluation savedEval = evaluationRepository.save(eval);
        doc.setStatus(DocumentStatus.COMPLETED); 
        documentRepository.save(doc);
        
        // Record teacher override
        adminService.logActivity("OVERRIDE", "Teacher (ID: " + teacherId + ")", "Overrode score for: " + doc.getFilename() + " to " + newScore);
        
        return mapToDTO(savedEval, doc.getFilename());
    }

    public EvaluationDTO getEvaluationByDocumentId(UUID documentId, UUID userId) {
        Evaluation eval = evaluationRepository.findByDocumentId(documentId).orElseThrow(() -> new IllegalArgumentException("Evaluation report not found."));
        Document doc = eval.getDocument();
        UUID classId = doc.getClassroom() != null ? doc.getClassroom().getId() : null;
        boolean isOwner = doc.getUser().getId().equals(userId);
        boolean isTeacherOfClass = false;
        if (classId != null) {
            try { classroomService.verifyClassroomOwnership(classId, userId); isTeacherOfClass = true; } catch (SecurityException e) { }
        }
        if (!isOwner && !isTeacherOfClass) throw new SecurityException("Unauthorized");
        return mapToDTO(eval, doc.getFilename());
    }
    
    private String fetchFileContentFromDrive(Document doc) throws IOException {
        String driveFileId = doc.getDriveFileId();
        if (driveFileId == null || driveFileId.isEmpty()) throw new IllegalArgumentException("Document is missing Google Drive File ID");
        try (InputStream inputStream = googleDriveService.downloadFile(driveFileId)) {
            String contentType = doc.getFileType();
            if ("application/pdf".equals(contentType)) return extractTextFromPDF(inputStream);
            else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) return extractTextFromDOCX(inputStream);
            else return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private String extractTextFromPDF(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) { return new PDFTextStripper().getText(document); }
    }

    private String extractTextFromDOCX(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) { return new XWPFWordExtractor(document).getText(); }
    }

    /**
     * Public method to validate if file content is an STD.
     * Called by DocumentService during upload to reject non-STD files immediately.
     */
    public boolean validateDocumentContent(String content) {
        return isValidSoftwareTestingDocument(content);
    }

    /**
     * Extract text from a MultipartFile for validation purposes.
     */
    public String extractTextFromFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        try (InputStream inputStream = file.getInputStream()) {
            if ("application/pdf".equals(contentType)) {
                return extractTextFromPDF(inputStream);
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return extractTextFromDOCX(inputStream);
            } else {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        }
    }

    /**
     * Validate a file from Google Drive by its file ID and mime type.
     * Used for Drive imports to reject non-STD files.
     */
    public boolean validateDriveFile(String driveFileId, String mimeType) {
        try (InputStream inputStream = googleDriveService.downloadFile(driveFileId)) {
            String content;
            if ("application/pdf".equals(mimeType)) {
                content = extractTextFromPDF(inputStream);
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(mimeType)) {
                content = extractTextFromDOCX(inputStream);
            } else {
                content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
            return isValidSoftwareTestingDocument(content);
        } catch (Exception e) {
            System.err.println("Drive file validation error: " + e.getMessage());
            return false; // Fail safely
        }
    }

    private boolean isValidSoftwareTestingDocument(String content) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            String validationPrompt = """
                You are a STRICT document classifier. Determine if this is a SOFTWARE TESTING DOCUMENT (STD).
                
                A VALID STD must contain ACTUAL TEST CONTENT such as:
                - Test cases with steps to execute
                - Test scenarios or test scripts
                - Test results or bug reports
                - QA test procedures
                - Unit/Integration/System test documentation
                
                REJECT these (they are NOT STDs even if software-related):
                - SRS (Software Requirements Specification) - contains requirements, not tests
                - FRS (Functional Requirements Specification) - contains features, not tests
                - Design Documents - contains architecture, not tests
                - User Manuals - contains instructions, not tests
                - Project Proposals - contains plans, not tests
                - Meeting Minutes, Essays, Resumes, or any non-testing content
                
                Look for keywords like: "Test Case ID", "Test Steps", "Expected Result", "Actual Result", 
                "Pass/Fail", "Test Scenario", "Preconditions", "Test Data", "Bug Report", "Defect".
                
                If you see mostly REQUIREMENTS (shall, must, should) instead of TEST STEPS, respond "NO".
                
                Respond with ONLY "YES" or "NO".
                """;
            String aiResponse = chatClient.prompt().system(validationPrompt).user(u -> u.text(content)).call().content();
            boolean isValid = aiResponse != null && aiResponse.trim().toUpperCase().startsWith("YES");
            if (!isValid) {
                System.out.println("Document rejected - not recognized as STD. AI Response: " + aiResponse);
            }
            return isValid;
        } catch (Exception e) { 
            System.err.println("STD validation error (will reject document): " + e.getMessage());
            return false; // Fail safely - require valid response
        }
    }

    private String truncateContent(String content) {
        if (!ENABLE_TRUNCATION || content == null) return content;
        return content.length() > 15000 ? content.substring(0, 15000) : content;
    }

    public List<EvaluationDTO> getUserEvaluations(UUID userId) {
        return evaluationRepository.findByUserId(userId).stream().map(eval -> mapToDTO(eval, eval.getDocument().getFilename())).collect(Collectors.toList());
    }

    private Evaluation mapToEntity(EvaluationResponse response, Document doc, UUID userId) {
        return Evaluation.builder().document(doc).userId(userId).completenessScore(response.completenessScore()).completenessFeedback(response.completenessFeedback()).clarityScore(response.clarityScore()).clarityFeedback(response.clarityFeedback()).consistencyScore(response.consistencyScore()).consistencyFeedback(response.consistencyFeedback()).verificationScore(response.verificationScore()).verificationFeedback(response.verificationFeedback()).overallScore(response.overallScore()).overallFeedback(response.overallFeedback()).build();
    }

    private EvaluationDTO mapToDTO(Evaluation eval, String filename) {
        return EvaluationDTO.builder().id(eval.getId()).documentId(eval.getDocument().getId()).filename(filename).completenessScore(eval.getCompletenessScore()).completenessFeedback(eval.getCompletenessFeedback()).clarityScore(eval.getClarityScore()).clarityFeedback(eval.getClarityFeedback()).consistencyScore(eval.getConsistencyScore()).consistencyFeedback(eval.getConsistencyFeedback()).verificationScore(eval.getVerificationScore()).verificationFeedback(eval.getVerificationFeedback()).overallScore(eval.getOverallScore()).overallFeedback(eval.getOverallFeedback()).createdAt(eval.getCreatedAt()).build();
    }
}