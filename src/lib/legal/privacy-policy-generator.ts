/**
 * Privacy Policy Generator
 *
 * Auto-generates privacy policy based on enabled features.
 * Sections are conditionally included based on what the artist uses.
 */

export interface PrivacyPolicyConfig {
  hasFacebookPixel: boolean
  hasGoogleAnalytics: boolean
  collectsEmails: boolean
  siteName: string
  siteUrl: string
}

/**
 * Generate privacy policy as Markdown string
 *
 * @param config - Features enabled for the artist
 * @returns Markdown-formatted privacy policy
 */
export function generatePrivacyPolicy(config: PrivacyPolicyConfig): string {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sections: string[] = []

  // Header
  sections.push(`# Privacy Policy`)
  sections.push(`**Last Updated:** ${lastUpdated}`)
  sections.push('')

  // Introduction
  sections.push(`## Introduction`)
  sections.push(
    `Welcome to ${config.siteName}. This Privacy Policy explains how we collect, use, and protect your information when you visit this page.`
  )
  sections.push('')
  sections.push(
    `We are committed to protecting your privacy and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).`
  )
  sections.push('')

  // Information We Collect
  sections.push(`## Information We Collect`)
  sections.push('')
  sections.push(`### Anonymous Analytics`)
  sections.push(
    `We track page views and link clicks using privacy-safe anonymous identifiers. No personal data is stored for analytics purposes. This helps us understand which content is most popular.`
  )
  sections.push('')

  // Conditional: Email Collection
  if (config.collectsEmails) {
    sections.push(`### Email Collection`)
    sections.push(
      `When you choose to provide your email address through our email collection forms, we store it securely to:`
    )
    sections.push(`- Send you updates, news, and announcements`)
    sections.push(`- Share exclusive content and offers`)
    sections.push(`- Sync with our email marketing platform (Mailchimp) for newsletters`)
    sections.push('')
    sections.push(
      `Your email will never be sold to third parties. You can unsubscribe at any time using the link in any email we send.`
    )
    sections.push('')
  }

  // Conditional: Facebook Pixel
  if (config.hasFacebookPixel) {
    sections.push(`### Facebook Pixel`)
    sections.push(
      `With your consent, we use the Facebook Pixel to track page visits and interactions. This allows us to:`
    )
    sections.push(`- Measure the effectiveness of our advertising campaigns`)
    sections.push(`- Build targeted audiences for future advertising`)
    sections.push(`- Understand how visitors interact with our content`)
    sections.push('')
    sections.push(
      `Facebook may collect information about your device, browser, and behavior on our site. For more information, see [Facebook's Data Policy](https://www.facebook.com/privacy/explanation).`
    )
    sections.push('')
  }

  // Conditional: Google Analytics
  if (config.hasGoogleAnalytics) {
    sections.push(`### Google Analytics`)
    sections.push(
      `With your consent, we use Google Analytics 4 (GA4) to understand visitor behavior and improve our content. GA4 collects:`
    )
    sections.push(`- Pages visited and time spent on each page`)
    sections.push(`- Device type, browser, and operating system`)
    sections.push(`- Geographic location (city/country level)`)
    sections.push(`- Traffic sources (how you found our page)`)
    sections.push('')
    sections.push(
      `Google Analytics data is anonymized and aggregated. For more information, see [Google's Privacy Policy](https://policies.google.com/privacy).`
    )
    sections.push('')
  }

  // How We Use Your Information
  sections.push(`## How We Use Your Information`)
  sections.push(`We use the information we collect to:`)
  sections.push(`- Improve the content and layout of this page`)
  sections.push(`- Understand which links and content are most popular`)
  sections.push(`- Measure the effectiveness of our promotional campaigns`)
  if (config.collectsEmails) {
    sections.push(`- Send you updates and newsletters (if you opted in)`)
  }
  sections.push('')

  // Cookie Policy
  sections.push(`## Cookie Policy`)
  sections.push(
    `We use cookies to remember your consent preferences and to enable analytics tracking (if you consented). Cookies are small text files stored on your device.`
  )
  sections.push('')
  sections.push(`**Types of cookies we use:**`)
  sections.push(
    `- **Essential cookies:** Remember your cookie consent choice (expires after 1 year)`
  )
  if (config.hasFacebookPixel || config.hasGoogleAnalytics) {
    sections.push(
      `- **Analytics cookies:** Track page views and interactions (only if you consented)`
    )
  }
  sections.push('')
  sections.push(
    `You can disable cookies in your browser settings, but this may affect site functionality.`
  )
  sections.push('')

  // Your Rights (GDPR + CCPA)
  sections.push(`## Your Rights`)
  sections.push('')
  sections.push(`### Under GDPR (EU Visitors)`)
  sections.push(`If you are in the European Union, you have the right to:`)
  sections.push(`- Access the personal data we hold about you`)
  sections.push(`- Request correction of inaccurate data`)
  sections.push(`- Request deletion of your data ("right to be forgotten")`)
  sections.push(`- Object to processing of your data`)
  sections.push(`- Withdraw consent at any time`)
  sections.push('')
  sections.push(`### Under CCPA (California Residents)`)
  sections.push(`If you are a California resident, you have the right to:`)
  sections.push(`- Know what personal information we collect`)
  sections.push(`- Request deletion of your personal information`)
  sections.push(`- Opt-out of the sale of personal information (we do not sell data)`)
  sections.push('')
  sections.push(
    `To exercise your rights, please contact us at the email address below.`
  )
  sections.push('')

  // Data Retention
  sections.push(`## Data Retention`)
  sections.push(`We retain your information for as long as necessary to provide our services:`)
  sections.push(
    `- **Anonymous analytics data:** Retained indefinitely for historical trend analysis`
  )
  if (config.collectsEmails) {
    sections.push(
      `- **Email addresses:** Retained until you unsubscribe or request deletion`
    )
  }
  sections.push(
    `- **Cookie consent:** Stored in your browser for 1 year, then re-requested`
  )
  sections.push('')

  // Third-Party Services
  if (config.hasFacebookPixel || config.hasGoogleAnalytics || config.collectsEmails) {
    sections.push(`## Third-Party Services`)
    sections.push(`We use the following third-party services:`)
    if (config.hasFacebookPixel) {
      sections.push(
        `- **Facebook:** For advertising tracking and audience building (with your consent)`
      )
    }
    if (config.hasGoogleAnalytics) {
      sections.push(`- **Google Analytics:** For website analytics (with your consent)`)
    }
    if (config.collectsEmails) {
      sections.push(`- **Mailchimp:** For email marketing and newsletter management`)
    }
    sections.push('')
    sections.push(
      `These services have their own privacy policies and may collect data independently. We recommend reviewing their policies.`
    )
    sections.push('')
  }

  // Changes to This Policy
  sections.push(`## Changes to This Policy`)
  sections.push(
    `We may update this Privacy Policy from time to time. The "Last Updated" date at the top will reflect any changes. Continued use of this page after changes constitutes acceptance of the updated policy.`
  )
  sections.push('')

  // Contact Information
  sections.push(`## Contact Information`)
  sections.push(`If you have questions about this Privacy Policy, please contact:`)
  sections.push('')
  sections.push(`**${config.siteName}**`)
  sections.push(`${config.siteUrl}`)
  sections.push('')
  sections.push(`For data protection inquiries or to exercise your rights, please email us.`)
  sections.push('')

  return sections.join('\n')
}
