package com.busticket.seeder;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Slf4j
public class PolicyPdfSeeder implements CommandLineRunner {

    private static final String POLICY_DIR = "src/main/resources/policies";
    private static final String POLICY_FILE = "src/main/resources/policies/bus_booking_policies.pdf";

    @Override
    public void run(String... args) {
        try {
            Path dirPath = Paths.get(POLICY_DIR);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            File file = new File(POLICY_FILE);
            if (!file.exists() || file.length() == 0) {
                generatePolicyPdf(file.getAbsolutePath());
                log.info("Successfully generated BusEase policy PDF at: {}", file.getAbsolutePath());
            } else {
                log.info("Policy PDF already exists at: {}", file.getAbsolutePath());
            }
        } catch (Exception e) {
            log.error("Failed to generate policy PDF: {}", e.getMessage(), e);
        }
    }

    public static void generatePolicyPdf(String destPath) throws Exception {
        PdfWriter writer = new PdfWriter(new FileOutputStream(destPath));
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        Paragraph title = new Paragraph("BusEase Official Travel Policies & Guidelines")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("Terms of Service, Cancellation Rules, Luggage Allowance & Passenger Guidelines")
                .setFontSize(12)
                .setItalic()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitle);
        document.add(new Paragraph("\n"));

        // Section 1: Cancellation & Refund Policy
        document.add(new Paragraph("1. CANCELLATION AND REFUND POLICY").setFontSize(14).setBold());
        document.add(new Paragraph(
                "• Cancellations made more than 24 hours prior to scheduled departure time are eligible for a 90% refund (10% processing fee deducted).\n" +
                "• Cancellations made between 12 hours and 24 hours prior to departure are eligible for a 75% refund (25% cancellation fee).\n" +
                "• Cancellations made between 2 hours and 12 hours prior to departure are eligible for a 50% refund (50% cancellation fee).\n" +
                "• Cancellations made less than 2 hours prior to departure or after departure are NON-REFUNDABLE (0% refund).\n" +
                "• All eligible refunds will be processed automatically back to the original payment method within 3 to 5 business days.\n" +
                "• Partial ticket cancellations (cancelling specific seat numbers while keeping others active) are fully supported through the 'My Trips' dashboard."
        ));
        document.add(new Paragraph("\n"));

        // Section 2: Luggage & Baggage Rules
        document.add(new Paragraph("2. LUGGAGE ALLOWANCE AND BAGGAGE RULES").setFontSize(14).setBold());
        document.add(new Paragraph(
                "• Each ticketed passenger is allowed up to 2 pieces of checked luggage with a maximum combined weight of 20 kg free of charge.\n" +
                "• One small hand bag or laptop bag weighing up to 7 kg is allowed inside the bus cabin.\n" +
                "• Excess baggage above the free 20 kg limit will incur an additional fee of $2 (or Rs. 50) per kilogram, payable at the boarding counter subject to cargo space availability.\n" +
                "• Prohibited items include: Explosives, flammable liquids, hazardous chemicals, illegal narcotics, unbagged sharp objects, and firearms.\n" +
                "• Live animals and pets are strictly prohibited on board, with the exception of certified service guide dogs accompanying passengers with disabilities."
        ));
        document.add(new Paragraph("\n"));

        // Section 3: Boarding & ID Requirements
        document.add(new Paragraph("3. BOARDING REQUIREMENTS AND ID VERIFICATION").setFontSize(14).setBold());
        document.add(new Paragraph(
                "• Passengers must arrive at the specified boarding point at least 15 minutes prior to the scheduled departure time.\n" +
                "• The primary passenger must present a valid government-issued photo ID (Passport, Driver's License, National ID Card, or Voter ID) matching the name on the booking ticket.\n" +
                "• Digital E-Tickets displayed on a smartphone screen are accepted for boarding. Physical paper printouts are optional.\n" +
                "• Bus operators reserve the right to deny boarding without refund if a valid photo ID is not presented or if the passenger is under the influence of alcohol or drugs."
        ));
        document.add(new Paragraph("\n"));

        // Section 4: Child & Senior Citizen Policies
        document.add(new Paragraph("4. CHILD TICKETING AND SENIOR CITIZEN POLICIES").setFontSize(14).setBold());
        document.add(new Paragraph(
                "• Children under 5 years of age can travel free of charge provided they sit on an adult passenger's lap and do not occupy a separate seat.\n" +
                "• Children 5 years of age and older require a separate ticket booking at standard fare rates.\n" +
                "• Senior citizens (ages 60 and above) are eligible for priority lower-deck seat selection during the booking process."
        ));
        document.add(new Paragraph("\n"));

        // Section 5: Payment & Hold Timers
        document.add(new Paragraph("5. PAYMENT METHODS AND SEAT LOCK EXPIRY").setFontSize(14).setBold());
        document.add(new Paragraph(
                "• BusEase accepts Credit Cards, Debit Cards, Net Banking, and UPI payments.\n" +
                "• Selected seats are placed on a temporary 5-minute lock hold during the checkout process.\n" +
                "• If payment confirmation is not completed within 5 minutes, the seat lock automatically expires and seats are released back to the public inventory pool."
        ));

        document.close();
    }
}
