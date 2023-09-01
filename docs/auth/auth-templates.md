import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Updating Email Templates with the SDK or CLI

## Overview

This document provides guidance on how to update email templates using the Dashboard or CLI.

Email templates are used to provide UI to send to your users when they need to verify their email or reset their password.

<hr class="solid" />

## Update Template

To update a template, you have to use the `UpdateSettings` endpoint within `ProjectSettings`. You need to pass a subject for the email (the name of the email you want to send) together with a body in HTML or plaintext. You can update the following templates using the SDK:

- Welcome Email
- Reset Password Email
- Verify Email

Below is an example where we update the email verification email:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
_, err := client.ProjectSettings().UpdateSettings(ctx, connect.NewRequest(&settings.UpdateSettingsRequest{
    Updates: []*settings.Update{
        {Field: &settings.Update_Templates{
            Templates: &settings.Templates{
                VerifyEmail: &settings.Template{
                    Body:    "<h1>Please verify your email {{ .Identifier }} using the following code: {{ .Code }}</h1>",
                    Subject: "",
                },
            },
        }},
    },
}))
if err != nil {
    log.Fatal(err)
}
log.Println("successfully updated email template")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
await client.projectSettings.updateSettings({
    updates: [
        {
            field: {
                case: "templates",
                value: {
                    body: "<h1>Please verify your email {{ .Identifier }} using the following code: {{ .Code }}</h1>",
                    subject: "",
                    }
                }
        }},
    ],
})
console.log("successfully updated email template")
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig project update-settings --field --value
```

Examples:

```sh
rig project update-settings -f template -v '{"type": "TEMPLATE_TYPE_EMAIL_VERIFICATION", "body": "<h1>Please verify your email {{ .Identifier }} using the following code: {{ .Code }}</h1>", "subject": ""}'
```

</TabItem>
</Tabs>
