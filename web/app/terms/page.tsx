import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl text-gray-900">
              Idea Feedback
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date: December 18, 2024</strong>
            </p>

            <p className="mb-6">
              These Terms of Service ("Terms") govern your use of Idea Feedback's web application and Chrome extension (collectively, the "Service"). By using our Service, you agree to these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using Idea Feedback, you agree to be bound by these Terms. If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Idea Feedback provides an AI-powered interview assistant that helps users conduct better user research interviews through:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Real-time transcription of interviews</li>
              <li>AI-generated follow-up questions and suggestions</li>
              <li>Automated note-taking and categorization</li>
              <li>Meeting summaries and insights</li>
              <li>Feature recommendations based on interview data</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
              <li>One person or legal entity may not maintain more than one account</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Distribute malware or harmful code</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Record individuals without their consent where required by law</li>
              <li>Process sensitive personal data without appropriate legal basis</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Content and Data</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Your Content</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain ownership of all content you create using the Service</li>
              <li>You grant us a license to store and process your content to provide the Service</li>
              <li>You are responsible for ensuring you have the right to use and share any content</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 AI-Generated Content</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>AI suggestions are provided as assistance and should be reviewed for accuracy</li>
              <li>We do not guarantee the accuracy or completeness of AI-generated content</li>
              <li>You are responsible for reviewing and validating all AI outputs</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
            <p className="mb-4">
              The Service integrates with third-party services including OpenAI. Your use of these services is subject to their respective terms and policies. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Obtaining and managing your own OpenAI API key</li>
              <li>Complying with OpenAI's usage policies</li>
              <li>Any costs incurred from third-party service usage</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Privacy and Data Protection</h2>
            <p className="mb-4">
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as detailed in the Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>The Service and its original content are and will remain our exclusive property</li>
              <li>Our trademarks and trade dress may not be used without our prior written permission</li>
              <li>You may not copy, modify, or create derivative works of the Service</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Service Provided "As Is"</h3>
            <p className="mb-4">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Limitation of Liability</h3>
            <p className="mb-4">
              IN NO EVENT SHALL IDEA FEEDBACK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless Idea Feedback from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>We may terminate or suspend your account at any time for violations of these Terms</li>
              <li>You may terminate your account at any time through the account settings</li>
              <li>Upon termination, your right to use the Service will immediately cease</li>
              <li>All provisions which by their nature should survive termination shall survive</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Modifications to Service and Terms</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>We reserve the right to modify or discontinue the Service at any time</li>
              <li>We may revise these Terms at any time by updating this page</li>
              <li>Continued use of the Service after changes constitutes acceptance of new Terms</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States and the State of California, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Dispute Resolution</h2>
            <p className="mb-4">
              Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <ul className="list-none mb-4">
              <li>Email: support@ideafeedback.co</li>
              <li>Website: https://ideafeedback.co</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">16. Entire Agreement</h2>
            <p className="mb-4">
              These Terms constitute the entire agreement between you and Idea Feedback regarding the use of the Service, superseding any prior agreements.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> December 18, 2024<br/>
                <strong>Version:</strong> 1.0<br/>
                <strong>Contact:</strong> support@ideafeedback.co
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}