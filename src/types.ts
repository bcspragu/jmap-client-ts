export type IMethodName =
  | 'Mailbox/get'
  | 'Mailbox/changes'
  | 'Mailbox/set'
  | 'Mailbox/query'
  | 'Email/get'
  | 'Email/changes'
  | 'Email/query'
  | 'Email/set'
  | 'Email/queryChanges'
  | 'Email/import'
  | 'Thread/get'
  | 'EmailSubmission/get'
  | 'EmailSubmission/changes'
  | 'EmailSubmission/set'
  | 'Identity/get'
  | 'Blob/get'

export type IErrorName = 'error'

export type IInvocationName = IMethodName | IErrorName

/**
 * See https://jmap.io/spec-core.html#the-invocation-data-type
 */
export type IInvocation<ArgumentsType> = [
  name: IInvocationName,
  arguments: ArgumentsType,
  methodCallId: string,
]

export type IEntityProperties =
  | IMailboxProperties
  | IEmailProperties
  | IEmailSubmissionProperties
  | IThreadProperties
  | IBlobProperties
  | IIdentityProperties

export type IResponseProperties =
  | IMailboxProperties
  | IEmailProperties
  | IEmailSubmissionProperties
  | IThreadProperties
  | IBlobProperties
  | IIdentityProperties

/**
 * See https://jmap.io/spec-core.html#query
 */
export type IFilterCondition = IMailboxFilterCondition | IEmailFilterCondition

export type IArguments =
  | IGetArguments<IEntityProperties>
  | ISetArguments<IEntityProperties>
  | IQueryArguments<IFilterCondition>
  | IChangesArguments
  | IQueryChangesArguments
  | IEmailSubmissionSetArguments
  | IEmailGetArguments
  | IEmailQueryArguments

export type IResponseArguments =
  | IGetResponse<IEntityProperties>
  | ISetResponse<IEntityProperties>
  | IQueryResponse
  | IChangesResponse
  | IQueryChangesResponse
  | IError

export interface IReplaceableAccountId {
  /**
   * If null, the library will replace its value by default account id.
   */
  accountId: string | null
}

type RefKey = `#${string}`

// 'keyof IEntityProperties', for example, will just be 'id', so we use this approach.
type KeysOfUnion<T> = T extends any ? keyof T : never

/**
 * See https://jmap.io/spec-core.html#get
 */
export interface IGetArguments<Properties extends IEntityProperties> extends IReplaceableAccountId {
  ids: string[] | null
  properties?: Array<KeysOfUnion<Properties>>
  [ref: RefKey]: ResultReference
}

export interface ResultReference {
  resultOf: string
  name: string
  path: string
}

/**
 * See https://jmap.io/spec-core.html#get
 */
export interface IGetResponse<Foo> {
  accountId: string
  state: string
  list: Foo[]
  notFound: string[]
}

/**
 * See https://jmap.io/spec-core.html#changes
 */
export interface IChangesArguments extends IReplaceableAccountId {
  sinceState: string
  maxChanges?: number | null
}

export interface IQueryChangesArguments extends IReplaceableAccountId {
  sinceQueryState: string
  maxChanges?: number | null
}

/**
 * See https://jmap.io/spec-core.html#changes
 */
export interface IChangesResponse {
  accountId: string
  oldState: string
  newState: string
  hasMoreChanges: boolean
  created: string[]
  updated: string[]
  destroyed: string[]
}

export interface IQueryChangesResponse {
  accountId: string // Id The id of the account used for the call.
  oldQueryState: string // String This is the sinceQueryState argument echoed back; that is, the state from which the server is returning changes.
  newQueryState: string // String This is the state the query will be in after applying the set of changes to the old state.
  total?: number // UnsignedInt (only if requested) The total number of Foos in the results (given the filter). This argument MUST be omitted if the calculateTotal request argument is not true.
  removed?: string[] // Id[] The id for every Foo that was in the query results in the old state and that is not in the results in the new state.
  added?: IAddedItem[] // AddedItem[] The id and index in the query results (in the new state) for every Foo that has been added to the results since the old state AND every Foo in the current results that was included in the removed array (due to a filter or sort based upon a mutable property).
}

export interface IAddedItem {
  id: string
  index: number
}

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetArguments<Properties extends IEntityProperties> extends IReplaceableAccountId {
  ifInState?: string
  create?: Record<string, Partial<Properties>>
  update?: Record<string, Partial<Properties> & Record<string, any>>
  destroy?: string[]
}

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetResponse<Foo> {
  accountId: string
  oldState?: string
  newState: string
  created?: Record<string, Foo>
  updated?: Record<string, Foo | null>
  destroyed?: string[]
  notCreated?: Record<string, ISetError>
  notUpdated?: Record<string, ISetError>
  notDestroyed?: Record<string, ISetError>
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IQueryArguments<FilterCondition extends IFilterCondition>
  extends IReplaceableAccountId {
  filter?: FilterCondition | IFilterOperator<FilterCondition>
  sort?: IComparator[]
  position?: number
  anchor?: string
  anchorOffset?: number
  limit?: number
  calculateTotal?: boolean
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IQueryResponse {
  accountId: string
  queryState: string
  canCalculateChanges: boolean
  position: number
  ids: string[]
  total?: number
  limit?: number
}

export interface IEmailQueryArguments extends IQueryArguments<IEmailFilterCondition> {
  collapseThreads?: boolean
}

export type IEmailQueryResponse = IQueryResponse

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IFilterOperator<FilterCondition> {
  operator: 'AND' | 'OR' | 'NOT'
  conditions: Array<FilterCondition | IFilterOperator<FilterCondition>>
}

/**
 * See https://jmap.io/spec-core.html#query
 */
export interface IComparator {
  property: string
  isAscending?: boolean
  collation?: string
}

/**
 * See https://jmap.io/spec-core.html#the-request-object
 */
export interface IRequest {
  using: string[]
  methodCalls: Array<IInvocation<IArguments>>
  createdIds?: Record<string, string>
}

export interface IResponse {
  methodResponses: Array<IInvocation<IResponseArguments>>
  createdIds?: Record<string, string>
  sessionState: string
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface ICapabilities {
  maxSizeUpload: number
  maxConcurrentUpload: number
  maxSizeRequest: number
  maxConcurrentRequests: number
  maxCallsInRequest: number
  maxObjectsInGet: number
  maxObjectsInSet: number
  collationAlgorithms: string[]
}

/**
 * See https://jmap.io/spec-mail.html#additions-to-the-capabilities-object
 */
export interface IMailCapabilities {
  maxMailboxesPerEmail?: number
  maxMailboxDepth?: number
  maxSizeMailboxName: number
  maxSizeAttachmentsPerEmail: number
  emailQuerySortOptions: string[]
  mayCreateTopLevelMailbox: boolean
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface IAccount {
  name: string
  isPersonal: boolean
  isReadOnly: boolean
  accountCapabilities: Record<string, IMailCapabilities>
}

/**
 * See https://jmap.io/spec-core.html#the-jmap-session-resource
 */
export interface ISession {
  capabilities: ICapabilities
  accounts: Record<string, IAccount>
  primaryAccounts: Record<string, string>
  username: string
  apiUrl: string
  downloadUrl: string
  uploadUrl: string
  eventSourceUrl: string
  state: string
}

export interface EmailHeader {
  name: string
  value: string
}

export type Attachment = IEmailBodyPart

/**
 * See https://jmap.io/spec-mail.html#emailget
 */
export interface IEmailGetArguments extends IGetArguments<IEmailProperties> {
  bodyProperties?: string[]
  fetchTextBodyValues?: boolean
  fetchHTMLBodyValues?: boolean
  fetchAllBodyValues?: boolean
  maxBodyValueBytes?: number
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailProperties {
  id: string
  messageId?: string[]
  inReplyTo?: string[]
  references?: string[]
  blobId: string
  threadId: string
  mailboxIds: Record<string, boolean>
  keywords: IEmailKeywords
  from: IEmailAddress[] | null
  to: IEmailAddress[] | null
  bodyValues: Record<string, IEmailBodyValue> | null
  textBody: Array<Partial<IEmailBodyPart>> | null
  htmlBody: Array<Partial<IEmailBodyPart>> | null
  subject: string
  date: Date
  size: number
  preview: string
  attachments: Attachment[] | null
  hasAttachment: boolean
  createdModSeq: number
  updatedModSeq: number
  receivedAt: IUtcDate
  headers: EmailHeader[] | null
}

export interface IIdentityGetArguments extends IGetArguments<IIdentityProperties> {
  bodyProperties?: string[]
  fetchTextBodyValues?: boolean
  fetchHTMLBodyValues?: boolean
  fetchAllBodyValues?: boolean
  maxBodyValueBytes?: number
}

export interface IIdentityProperties {
  id: string // Id (immutable; server-set) The id of the Identity.
  name: string // String (default: “”) The “From” name the client SHOULD use when creating a new Email from this Identity.
  email: string // String (immutable) The “From” email address the client MUST use when creating a new Email from this Identity. If the mailbox part of the address (the section before the “@”) is the single character * (e.g., *@example.com) then the client may use any valid address ending in that domain (e.g., foo@example.com).
  replyTo?: IEmailAddress[] // EmailAddress[]|null (default: null) The Reply-To value the client SHOULD set when creating a new Email from this Identity.
  bcc?: IEmailAddress[] // EmailAddress[]|null (default: null) The Bcc value the client SHOULD set when creating a new Email from this Identity.
  textSignature: string // String (default: “”) A signature the client SHOULD insert into new plaintext messages that will be sent from this Identity. Clients MAY ignore this and/or combine this with a client-specific signature preference.
  htmlSignature: string // String (default: “”) A signature the client SHOULD insert into new HTML messages that will be sent from this Identity. This text MUST be an HTML snippet to be inserted into the <body></body> section of the HTML. Clients MAY ignore this and/or combine this with a client-specific signature preference.
  mayDelete?: boolean // Boolean (server-set) Is the user allowed to delete this Identity? Servers may wish to set this to false for the user’s username or other default address. Attempts to destroy an Identity with mayDelete: false will be rejected with a standard forbidden SetError.
}

export type IUtcDate = string
export type ITrue = true

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailKeywords {
  $draft?: ITrue
  $seen?: ITrue
  $flagged?: ITrue
  $answered?: ITrue
  $forwarded?: ITrue
  $phishing?: ITrue
  $junk?: ITrue
  $notjunk?: ITrue
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailAddress {
  name: string
  email: string
}

/**
 * See https://jmap.io/spec-mail.html#threads
 */
export interface IThreadProperties {
  id: string
  emailIds: string[]
}

export type IThreadGetArguments = IGetArguments<IThreadProperties>

export type IThreadGetResponse = IGetResponse<IThreadProperties>

export type IIdentityGetResponse = IGetResponse<IIdentityProperties>

/**
 * See https://jmap.io/spec-core.html#uploading-binary-data
 */
export interface IUploadResponse {
  accountId: string
  blobId: string
  type: string
  size: number
}

/**
 * See https://jmap.io/spec-mail.html#emailimport
 */
export interface IEmailImport {
  blobId: string
  mailboxIds: Record<string, ITrue>
  keywords: IEmailKeywords
  receivedAt: IUtcDate
}

export interface IEmailImportArguments extends IReplaceableAccountId {
  ifInState: string | null
  emails: Record<string, IEmailImport>
}

export interface IEmailImportResponse {
  accountId: string
  oldState?: string | null
  newState: string
  created?: Record<string, IEmailProperties> | null
  notCreated?: Record<string, ISetError> | null
}

/**
 * See https://jmap.io/spec-mail.html#mailboxes
 */
export interface IMailboxRights {
  mayReadItems: boolean
  mayAddItems: boolean
  mayRemoveItems: boolean
  mayCreateChild: boolean
  mayRename: boolean
  mayDelete: boolean
}

export interface IBlobProperties {
  id: string
  size: number
  'data:asText': string
  'digest:sha': string
}

/**
 * See https://jmap.io/spec-mail.html#mailboxes
 */
export interface IMailboxProperties {
  id: string
  name: string
  parentId?: string
  role?: string
  sortOrder: number
  totalEmails: number
  unreadEmails: number
  totalThreads: number
  unreadThreads: number
  myRights: IMailboxRights
  isSubscribed: false
}

export type IMailboxGetArguments = IGetArguments<IMailboxProperties>

export type IMailboxGetResponse = IGetResponse<IMailboxProperties>

export type IMailboxChangesArguments = IChangesArguments

/**
 * See https://jmap.io/spec-mail.html#mailboxchanges
 */
export interface IMailboxChangesResponse extends IChangesResponse {
  updatedProperties: string[] | null
}

export type IMailboxSetArguments = ISetArguments<IMailboxProperties>

export type IMailboxSetResponse = ISetResponse<IMailboxProperties>

/**
 * See https://jmap.io/spec-core.html#method-level-errors
 */
export interface IError {
  type: IErrorType
}

/**
 * See https://jmap.io/spec-core.html#creation-of-jmap-error-codes-registry
 */
export type IErrorType =
  | 'accountNotFound'
  | 'accountNotSupportedByMethod'
  | 'accountReadOnly'
  | 'anchorNotFound'
  | 'alreadyExists'
  | 'cannotCalculateChanges'
  | 'forbidden'
  | 'fromAccountNotFound'
  | 'fromAccountNotSupportedByMethod'
  | 'invalidArguments'
  | 'invalidPatch'
  | 'invalidProperties'
  | 'notFound'
  | 'notJSON'
  | 'notRequest'
  | 'overQuota'
  | 'rateLimit'
  | 'requestTooLarge'
  | 'invalidResultReference'
  | 'serverFail'
  | 'serverPartialFail'
  | 'serverUnavailable'
  | 'singleton'
  | 'stateMismatch'
  | 'tooLarge'
  | 'tooManyChanges'
  | 'unknownCapability'
  | 'unknownMethod'
  | 'unsupportedFilter'
  | 'unsupportedSort'
  | 'willDestroy'

/**
 * See https://jmap.io/spec-core.html#set
 */
export interface ISetError {
  type: IErrorType
  description?: string
  properties?: string[]
}

export interface IMailboxEmailList {
  id: string // mailboxId . (Max_Int64 - EmailDate) . uid
  threadId: string
  messageId: string
  updatedModSeq: number // Documentation says it is string, must be an error
  created: Date
  deleted: Date | null
}

export type IEmailChangesArguments = IChangesArguments

export type IEmailChangesResponse = IChangesResponse

export type IThreadChangesResponse = IChangesResponse

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailBodyValue {
  value: string
  isEncodingProblem?: boolean
  isTruncated?: boolean
}

/**
 * See https://jmap.io/spec-mail.html#properties-of-the-email-object
 */
export interface IEmailBodyPart {
  partId: string
  blobId: string
  size: number
  headers: EmailHeader[]
  name: string | null
  type: string
  charset: string | null
  disposition: string | null
  cid: string | null
  language: string[] | null
  location: string | null
  subParts: IEmailBodyPart[] | null
  bodyStructure: IEmailBodyPart
  bodyValues: Record<string, IEmailBodyValue>
  textBody: IEmailBodyPart[] // text/plain
  htmlBody: IEmailBodyPart[] // text/html
  attachments: IEmailBodyPart[]
  hasAttachment: boolean
  preview: string
}

/**
 * See https://jmap.io/spec-mail.html#emailset
 */
export interface IEmailSetBodyPart {
  partId: string
  type: string
}

/**
 * See https://jmap.io/spec-mail.html#mailboxquery
 */
export interface IMailboxFilterCondition {
  parentId?: string | null
  name?: string
  role?: string | null
  hasAnyRole?: boolean
  isSubscribed?: boolean
}

/**
 * See https://jmap.io/spec-mail.html#emailquery
 */
export interface IEmailFilterCondition {
  inMailbox?: string
  inMailboxOtherThan?: string[]
  before?: IUtcDate
  after?: IUtcDate
  minSize?: number
  maxSize?: number
  allInThreadHaveKeyword?: string
  someInThreadHaveKeyword?: string
  noneInThreadHaveKeyword?: string
  hasKeyword?: string
  notKeyword?: string
  hasAttachment?: boolean
  text?: string
  from?: string
  to?: string
  cc?: string
  bcc?: string
  subject?: string
  body?: string
  header?: string[]
}

export type IBlobGetResponse = IGetResponse<IBlobProperties>

export type IEmailGetResponse = IGetResponse<IEmailProperties>

export type IEmailSetArguments = ISetArguments<IEmailProperties>

export type IEmailSetResponse = ISetResponse<IEmailProperties>

/**
 * See https://jmap.io/spec-mail.html#email-submission
 */
export interface DeliveryStatus {
  smtpReply: string
  delivered: 'queued' | 'yes' | 'no' | 'unknown'
  displayed: 'unknown' | 'yes'
}

/**
 * See https://jmap.io/spec-mail.html#email-submission
 */
export interface Address {
  email: string
  parameters?: Record<string, string | null> | null
}
/**
 * See https://jmap.io/spec-mail.html#email-submission
 */
export interface Envelope {
  mailFrom: Address
  rcptTo: Address[]
}
/**
 * See https://jmap.io/spec-mail.html#email-submission
 */
export interface IEmailSubmissionProperties {
  id: string
  identityId: string
  emailId: string
  threadId: string
  envelope: Envelope | null
  sendAt: IUtcDate
  undoStatus: 'pending' | 'final' | 'canceled'
  deliveryStatus: Record<string, DeliveryStatus> | null
  dsnBlobIds: string[]
  mdnBlobIds: string[]
}

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionget
 */
export type IEmailSubmissionGetArguments = IGetArguments<IEmailSubmissionProperties>

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionchanges
 */
export type IEmailSubmissionChangesArguments = IChangesArguments

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionchanges
 */
export type IEmailSubmissionChangesResponse = IChangesResponse

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionget
 */
export type IEmailSubmissionGetResponse = IGetResponse<IEmailSubmissionProperties>

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionset
 */
export type IEmailSubmissionSetArguments = ISetArguments<IEmailSubmissionProperties> & {
  onSuccessUpdateEmail?: Record<string, Partial<IEmailProperties> & Record<string, any>> | null
  onSuccessDestroyEmail?: string[] | null
}

/**
 * See https://jmap.io/spec-mail.html#emailsubmissionset
 */
export type IEmailSubmissionSetResponse = ISetResponse<IEmailSubmissionProperties>
