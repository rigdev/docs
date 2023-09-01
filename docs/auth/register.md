import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Registering Users using the SDK or CLI

## Overview

This document provides instructions on registering users using either the SDK or CLI. You have the option to manage authentication through your own backend or directly from the frontend. In the following example, we demonstrate the use of the SDK with backend languages.

<hr class="solid" />

## Register

To register users in your backend, you can utilize the Register endpoint. When registering a user, you must supply a password and an identifier. The identifiers can be usernames, emails, or phone numbers.

To control the enabled identifiers in your system, please refer to the [login methods section](/auth/auth-settings).

Make sure to set the `ApiKey` field to match your project ID. Register a user with an email and password, by executing the following command:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
resp, err := client.Authentication().Register(ctx, connect.NewRequest(&authentication.RegisterRequest{
    Method: &authentication.RegisterRequest_UserPassword{
        UserPassword: &authentication.UserPassword{
            Password:   "YourPassword1234!",
            Identifier: &model.UserIdentifier{Identifier: &model.UserIdentifier_Email{Email: "johndoe@acme.com"}},
            ApiKey:     "YOU-API-KEY",
        },
    },
}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully created user with id %s", resp.Msg.UserId.String())
log.Printf("generated token pair: \nAccess token: %s\nRefresh token: %s", resp.Msg.Token.AccessToken, resp.Msg.Token.RefreshToken)
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const resp = await client.auth.register({
  method: {
    case: "userPassword",
    value: {
      identifier: {
        identifier: {
          case: "email",
          value: "johndoe@acme.com",
        },
      },
      password: "YourPassword1234!",
      projectId: "YourProjectId",
    },
  },
});
console.log(`successfully created user with id ${resp.userId}`);
console.log(
  `generated token pair: \nAccess token: %s\nRefresh token: ${resp.token?.accessToken}`,
);
```

</TabItem>
</Tabs>

When a user is created using the username/password method, the response will include an access token and a refresh token pair. However, if a user is created using the email/password or phone/password method, it is necessary for that user to [verify their account](/auth/login#verify-email) before they can log in.
