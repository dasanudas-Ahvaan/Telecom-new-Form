import React from "react";

export function ChoiceTermsViewer({ choice, agreement, onAgreementChange }) {
  
  // Helper to render choice-specific terms combined with Ahvaan's standard terms
  const renderTermsContent = () => {
    switch (choice._id) {
      
      // 1. Ahvaan Dharmik Classes
      case "ahvn-dharmik-class":
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Terms & Conditions: Ahvaan Dharmik Classes
            </h5>
            <p className="italic text-amber-700 text-xs">
              "The study of dharmik books and dharm philosophy under the guidance of Shivansh Narayan Dwivedi Ji"
            </p>

            <p>
              <strong>1. Commitment to Study:</strong> Participants enrolled in the Dharmik Classes commit to maintaining regular attendance, deep focus, and an earnest approach toward learning sacred literature.
            </p>
            <p>
              <strong>2. Discipline and Decorum:</strong> All learners must maintain strict decorum during sessions. Any form of disruptive behavior, disrespect toward teachers, or divergence from the core path of dharm will result in immediate termination of access.
            </p>
            <p>
              <strong>3. Intellectual Property:</strong> Notes, lectures, audio/video recordings, and insights shared under the guidance of Shivansh Narayan Dwivedi Ji are strictly for personal spiritual enrichment and must not be distributed commercially.
            </p>
            <p>
              <strong>4. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>5. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>6. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>7. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>8. Spiritual & Educational Nature:</strong> The teachings, interpretations, and guidance offered under Ahvaan are meant to foster personal growth, moral clarity, and intellectual understanding of dharmik traditions. They do not constitute formal legal, medical, or professional advice.
            </p>
            <p>
              <strong>9. Availability of Services:</strong> While we strive to maintain uninterrupted access to our platform, Ahvaan does not guarantee that the website or services will always be operational, error-free, or secure from technical glitches.
            </p>
            <p>
              <strong>10. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform, participation in studies, or reliance on any philosophical interpretations provided.
            </p>
            <p>
              <strong>11. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>12. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );
      
      // 2. Ahvaan Naam astra
      case "ahvn-naam astra":
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Terms & Conditions: Ahvaan Naam astra
            </h5>
            <p className="italic text-amber-700 text-xs">
              "Daily naam jap in five sessions along with other devotional means through online mode - As per instruction of Pujya Gurudev Puri Shankaracharya"
            </p>

            <p>
              <strong>1. Strict Adherence:</strong> Participants pledge to follow the structured daily *naam jap* routine across the designated five sessions in strict alignment with the instructions of Pujya Gurudev Puri Shankaracharya.
            </p>
            <p>
              <strong>2. Purity of Intent:</strong> This program is designed purely for spiritual elevation and inner sadhana. Misuse of the platform for secondary or non-devotional objectives is strictly prohibited.
            </p>
            <p>
              <strong>3. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>4. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>5. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>6. Usage License:</strong> Content is provided strictly for your personal, non-commercial educational use. You may not copy, distribute, modify, broadcast, or commercially exploit any material from Ahvaan without prior written consent.
            </p>
            <p>
              <strong>7. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>8. Spiritual & Educational Nature:</strong> The teachings, interpretations, and guidance offered under Ahvaan are meant to foster personal growth, moral clarity, and intellectual understanding of dharmik traditions. They do not constitute formal legal, medical, or professional advice.
            </p>
            <p>
              <strong>9. Availability of Services:</strong> While we strive to maintain uninterrupted access to our platform, Ahvaan does not guarantee that the website or services will always be operational, error-free, or secure from technical glitches.
            </p>
            <p>
              <strong>10. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform, participation in studies, or reliance on any philosophical interpretations provided.
            </p>
            <p>
              <strong>11. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>12. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );

      // 3. Financial Assistance
      case "financial-assistance":
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Terms & Conditions: Financial Assistance for Dharm
            </h5>
            <p className="italic text-amber-700 text-xs">
              "Monetary contribution and support dedicated to the preservation and propagation of dharm"
            </p>

            <p>
              <strong>1. Voluntary Contribution:</strong> All financial assistance provided through this channel is strictly voluntary and dedicated entirely to the mission and operational framework of Ahvaan.
            </p>
            <p>
              <strong>2. Non-Refundable Policy:</strong> Once processed, contributions made toward dharmik initiatives or recurring support are non-refundable under any circumstances.
            </p>
            <p>
              <strong>3. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>4. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>5. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>6. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>7. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform, participation in studies, or financial contributions provided.
            </p>
            <p>
              <strong>8. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>9. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );

      // 4. Ground Work
      case "ground-work":
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Terms & Conditions: Ground Work & Field Deployment
            </h5>
            <p className="italic text-amber-700 text-xs">
              "Be a soldier of Aditya Vahini, get complete guidance for fieldwork"
            </p>

            <p>
              <strong>1. Legal and Lawful Conduct:</strong> As a field worker or representative acting in coordination with Aditya Vahini and Ahvaan, you strictly agree to abide by local laws, constitutional boundaries, and civil regulations at all times.
            </p>
            <p>
              <strong>2. Accountability and Safety:</strong> Field operations require extreme maturity, discipline, and caution. Volunteers are responsible for their personal actions and must strictly follow tactical/administrative directives given by assigned leads.
            </p>
            <p>
              <strong>3. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>4. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>5. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>6. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>7. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform, participation in studies, or fieldwork operations.
            </p>
            <p>
              <strong>8. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>9. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );

      // 5. Online Assistance
      case "online-assistance":
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Terms & Conditions: Online Assistance & Skill Volunteering
            </h5>
            <p className="italic text-amber-700 text-xs">
              "Volunteer for expertise-specific skill related contribution toward organizational media and tech infrastructure"
            </p>

            <p>
              <strong>1. Confidentiality:</strong> Digital assets, source code, media files, unreleased content, and strategic plans handled during your volunteering tenure remain the intellectual property of Ahvaan and must not be leaked or shared externally.
            </p>
            <p>
              <strong>2. Quality and Ownership:</strong> Any creative work, code, video edit, or graphic design produced for Ahvaan becomes part of the organization's institutional archive for dharmik outreach.
            </p>
            <p>
              <strong>3. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>4. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>5. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>6. Usage License:</strong> Content is provided strictly for your personal, non-commercial educational use. You may not copy, distribute, modify, broadcast, or commercially exploit any material from Ahvaan without prior written consent.
            </p>
            <p>
              <strong>7. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>8. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform or volunteering tasks.
            </p>
            <p>
              <strong>9. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>10. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );

      default:
        // Default fallback
        return (
          <div className="space-y-4 text-sm">
            <h5 className="font-bold text-gray-900 text-base border-b pb-2">
              Ahvaan General Terms & Conditions
            </h5>
            <p className="italic text-amber-700 text-xs">
              "The study of dharmik books and dharm philosophy under the guidance of Ahvaan"
            </p>
            <p>
              <strong>1. Eligibility:</strong> You must provide accurate, current, and complete information during registration.
            </p>
            <p>
              <strong>2. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials (including your password and access tokens).
            </p>
            <p>
              <strong>3. Account Restriction:</strong> Ahvaan reserves the right to suspend or terminate accounts, revoke access, or refuse service at its sole discretion if any user violates these terms or engages in disruptive behavior.
            </p>
            <p>
              <strong>4. Usage License:</strong> Content is provided strictly for your personal, non-commercial educational use. You may not copy, distribute, modify, broadcast, or commercially exploit any material from Ahvaan without prior written consent.
            </p>
            <p>
              <strong>5. Code of Conduct:</strong> Users agree not to use offensive, disrespectful, or abusive language during live sessions, discussions, or forums; disseminate propaganda, hate speech, or content contradictory to the peaceful pursuit of knowledge and philosophy; or attempt to bypass security controls, reverse-engineer the platform, or gain unauthorized access to administrative or member data.
            </p>
            <p>
              <strong>6. Limitation of Liability:</strong> To the fullest extent permitted by law, Ahvaan, its founders, teachers, and administrators shall not be held liable for any direct, indirect, incidental, or consequential damages arising out of or in connection with your use of the platform.
            </p>
            <p>
              <strong>7. Changes to Terms:</strong> Ahvaan reserves the right to modify, update, or replace these Terms and Conditions at any time. Your continued use of the platform after changes constitutes your acceptance of the revised terms.
            </p>
            <p>
              <strong>8. Contact Us:</strong> If you have any questions or concerns regarding these Terms and Conditions, please reach out to us through our official support channels or website.
            </p>
          </div>
        );
    }
  };

  return (
    <section className="space-y-4 rounded-lg">
     
      {/* Scrollable text box rendering context-specific extended TnC */}
      <div className="h-56 md:h-72 w-full rounded border border-gray-300 overflow-y-auto bg-white p-5 text-gray-700 shadow-inner">
        {renderTermsContent()}
      </div>

      {/* Checkbox and agreement logic */}
      {/* <label className="flex items-start justify-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={!!agreement}
          onChange={(e) => onAgreementChange(choice._id, e.target.checked)}
          className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
        <p className="font-medium select-none text-gray-800 text-sm">
          I have read and agree to the terms and conditions for{" "}
          <span className="font-semibold text-amber-700">{choice.title}</span>.
        </p>
      </label> */}
    </section>
  );
}