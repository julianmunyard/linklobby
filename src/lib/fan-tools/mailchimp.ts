// src/lib/fan-tools/mailchimp.ts
// Mailchimp integration for syncing collected emails

import mailchimp from "@mailchimp/mailchimp_marketing"

// Initialize Mailchimp client with environment variables
const apiKey = process.env.MAILCHIMP_API_KEY
const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

let isConfigured = false

if (apiKey && serverPrefix) {
  mailchimp.setConfig({
    apiKey,
    server: serverPrefix,
  })
  isConfigured = true
}

export interface AddSubscriberResult {
  success: boolean
  alreadyExists?: boolean
  error?: string
}

/**
 * Check if Mailchimp is configured with required environment variables
 */
export function isMailchimpConfigured(): boolean {
  return isConfigured
}

/**
 * Add a subscriber to a Mailchimp list/audience
 *
 * @param listId - The Mailchimp list/audience ID
 * @param email - The subscriber's email address
 * @param firstName - Optional first name
 * @returns Result object indicating success or if member already exists
 */
export async function addSubscriber(
  listId: string,
  email: string,
  firstName?: string
): Promise<AddSubscriberResult> {
  if (!isConfigured) {
    return {
      success: false,
      error: "Mailchimp not configured. Set MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX.",
    }
  }

  try {
    await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "subscribed",
      merge_fields: firstName ? { FNAME: firstName } : undefined,
    })

    return { success: true }
  } catch (error: unknown) {
    // Handle "Member Exists" error (status 400 with specific title)
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 400
    ) {
      const mailchimpError = error as { response?: { body?: { title?: string } } }
      if (mailchimpError.response?.body?.title === "Member Exists") {
        return { success: true, alreadyExists: true }
      }
    }

    // Log and return other errors
    console.error("Mailchimp addSubscriber error:", error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to add subscriber to Mailchimp"

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Verify Mailchimp connection and list access
 *
 * @param listId - The Mailchimp list/audience ID to verify
 * @returns Object indicating if connection and list are valid
 */
export async function verifyMailchimpConnection(listId: string): Promise<{
  valid: boolean
  error?: string
}> {
  if (!isConfigured) {
    return {
      valid: false,
      error: "Mailchimp not configured",
    }
  }

  try {
    // Try to get list info to verify access
    await mailchimp.lists.getList(listId)
    return { valid: true }
  } catch (error: unknown) {
    console.error("Mailchimp verification error:", error)

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return { valid: false, error: "List not found" }
    }

    return {
      valid: false,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
