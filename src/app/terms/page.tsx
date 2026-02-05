import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - LinkLobby',
  description: 'Terms of Service for LinkLobby link-in-bio platform',
}

/**
 * Terms of Service Page
 *
 * Static content for LinkLobby platform terms
 */
export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-slate lg:prose-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-700 mb-8">
            <strong className="font-semibold">Last Updated:</strong> {lastUpdated}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Agreement to Terms
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            By accessing or using LinkLobby ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, you may not use the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Description of Service
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            LinkLobby is a link-in-bio page builder designed for artists, musicians, and
            creators. The Service allows you to:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li className="mb-1">Create a custom public profile page with links to your content</li>
            <li className="mb-1">
              Customize the appearance of your page with themes, colors, and layouts
            </li>
            <li className="mb-1">Embed music and video content from supported platforms</li>
            <li className="mb-1">Collect email addresses from your audience</li>
            <li className="mb-1">Track analytics on page views and link clicks</li>
            <li className="mb-1">Schedule links to publish at specific times</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Accounts</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You agree to:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li className="mb-1">Provide accurate and complete registration information</li>
            <li className="mb-1">Update your information to keep it accurate</li>
            <li className="mb-1">
              Notify us immediately of any unauthorized use of your account
            </li>
            <li className="mb-1">
              Be responsible for all content posted through your account
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Content</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You retain ownership of all content you post to your LinkLobby page. By posting
            content, you grant LinkLobby a license to display, distribute, and store your
            content as necessary to provide the Service.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You are solely responsible for the content you post and must ensure it does not
            violate any laws or third-party rights.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptable Use</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li className="mb-1">
              Violate any laws or regulations
            </li>
            <li className="mb-1">
              Infringe on intellectual property rights of others
            </li>
            <li className="mb-1">
              Distribute malware, viruses, or harmful code
            </li>
            <li className="mb-1">
              Harass, threaten, or abuse other users
            </li>
            <li className="mb-1">
              Engage in spam, phishing, or fraudulent activities
            </li>
            <li className="mb-1">
              Attempt to gain unauthorized access to the Service or other users' accounts
            </li>
            <li className="mb-1">
              Scrape, crawl, or systematically extract data from the Service
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Intellectual Property
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            The Service, including its design, code, logos, and trademarks, is owned by
            LinkLobby and protected by copyright, trademark, and other intellectual property
            laws. You may not copy, modify, distribute, or reverse engineer any part of the
            Service without written permission.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We reserve the right to suspend or terminate your account at any time, with or
            without notice, if:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li className="mb-1">You violate these Terms of Service</li>
            <li className="mb-1">Your account is inactive for an extended period</li>
            <li className="mb-1">
              We are required to do so by law or regulatory authority
            </li>
          </ul>
          <p className="text-gray-700 mb-4 leading-relaxed">
            You may terminate your account at any time by contacting us. Upon termination, your
            public page will be unpublished, but we may retain certain data as required by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Disclaimer of Warranties
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li className="mb-1">The Service will be uninterrupted or error-free</li>
            <li className="mb-1">Defects will be corrected</li>
            <li className="mb-1">
              The Service is free from viruses or harmful components
            </li>
            <li className="mb-1">The results obtained from use will be accurate or reliable</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LINKLOBBY SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT
            NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE
            OF THE SERVICE.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Our total liability to you for any claims arising from your use of the Service
            shall not exceed the amount you paid us in the twelve months prior to the event
            giving rise to liability.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Changes to Terms
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We may update these Terms of Service from time to time. When we do, we will revise
            the "Last Updated" date at the top of this page. Continued use of the Service after
            changes constitutes acceptance of the updated terms.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            For significant changes, we may provide additional notice, such as an email
            notification or prominent notice on the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Contact Information
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong className="font-semibold">LinkLobby</strong>
            <br />
            https://linklobby.com
          </p>
        </article>
      </div>
    </div>
  )
}
