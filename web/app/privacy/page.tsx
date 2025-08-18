import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date: December 18, 2024</strong>
            </p>

            <p className="mb-6">
              Idea Feedback ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application and Chrome extension.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (name, email address) when you sign up through Clerk authentication</li>
              <li>Interview transcripts and notes you create</li>
              <li>Settings and preferences you configure</li>
              <li>OpenAI API key (stored locally in your browser only)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Usage data (features used, frequency of use)</li>
              <li>Technical information (browser type, operating system)</li>
              <li>Interview metadata (duration, timestamp)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Chrome Extension Permissions</h3>
            <p className="mb-4">Our Chrome extension requires certain permissions to function:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>activeTab:</strong> To inject the interview assistant into video conferencing tabs</li>
              <li><strong>storage:</strong> To save your preferences and interview data locally</li>
              <li><strong>scripting:</strong> To add the interview interface to video call pages</li>
              <li><strong>webNavigation:</strong> To detect when you visit supported video platforms</li>
              <li><strong>tabs:</strong> To manage the extension across different tabs</li>
              <li><strong>offscreen:</strong> To process audio for transcription in the background</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our service</li>
              <li>Authenticate your account and enable sign-in</li>
              <li>Store and sync your interview data across devices</li>
              <li>Generate AI-powered suggestions and summaries</li>
              <li>Improve our service and develop new features</li>
              <li>Respond to your support requests</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Storage and Security</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Local Storage:</strong> Your OpenAI API key and preferences are stored locally in your browser and never transmitted to our servers</li>
              <li><strong>Cloud Storage:</strong> Interview data is stored securely in Supabase with encryption at rest</li>
              <li><strong>Authentication:</strong> We use Clerk for secure authentication and never store passwords</li>
              <li><strong>Encryption:</strong> All data transmission occurs over HTTPS</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
            <p className="mb-4">We integrate with the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Clerk:</strong> For authentication and user management</li>
              <li><strong>OpenAI:</strong> For AI-powered features (your API key connects directly to OpenAI)</li>
              <li><strong>Supabase:</strong> For database storage (when configured)</li>
              <li><strong>Vercel:</strong> For web application hosting</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information. We may share your information only in these circumstances:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and download your data</li>
              <li>Correct or update your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of non-essential data collection</li>
              <li>Export your interview data</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p className="mb-4">
              We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time by contacting us or using the "Clear All Data" option in the Chrome extension settings.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Effective Date."
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <ul className="list-none mb-4">
              <li>Email: support@ideafeedback.co</li>
              <li>Website: https://ideafeedback.co</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. California Privacy Rights</h2>
            <p className="mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. European Privacy Rights (GDPR)</h2>
            <p className="mb-4">
              If you are in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>

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