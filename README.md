This fork does the following:

- Updates all the deps to latest
- Adds a bunch of JMAP types (Identity, Blob, EmailSubmission, etc) that were missing, as well as responses and various missing fields.
- Removes the actual client itself, this repo is just types
- Removes all the Git hooks and JS libs aside from ESLint
- Removes other adjacent files (Jest, Jenkins, etc)

Basically, this repo is stripped to just the types, and those have been updated

# jmap-client-ts

A [Jmap](https://jmap.io/spec.html) Client written in Typescript.

## How to use it

Import in in your project (in you `package.json`), you can reference a commit or a branch to use snapshot versions.

Create the client
```typescript
import { Client } from "jmap-client-ts";
import { FetchTransport } from "jmap-client-ts/lib/utils/fetch-transport";

let client = new Client({
    accessToken: 'myToken',
    sessionUrl: 'http://jmap.example.com/session',
    transport: new FetchTransport(fetch)
});
```

Fetch the session, it will return a promise (of void), the result will be stored on the client and can be accesed later with `getSession()`
```typescript
client.fetchSession();
```

When the `fetchSession()` promise resolves, you can make requests, the name of the method corresponds to the names in the specs, with lowerCamelCase, and the `/` replaced by a `_`, it will return a promise.
```typescript
client.mailbox_get({
    accountId: Object.keys(jmapClient.getSession().accounts)[0],
    ids: null,
})
```
