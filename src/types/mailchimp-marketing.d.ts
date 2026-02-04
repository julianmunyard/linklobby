// Type declarations for @mailchimp/mailchimp_marketing
// The package doesn't include TypeScript types

declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpConfig {
    apiKey: string
    server: string
  }

  interface MergeFields {
    FNAME?: string
    LNAME?: string
    [key: string]: string | undefined
  }

  interface AddListMemberBody {
    email_address: string
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional'
    merge_fields?: MergeFields
  }

  interface ListsAPI {
    addListMember(listId: string, body: AddListMemberBody): Promise<unknown>
    getList(listId: string): Promise<unknown>
  }

  interface MailchimpClient {
    setConfig(config: MailchimpConfig): void
    lists: ListsAPI
  }

  const client: MailchimpClient
  export default client
}
