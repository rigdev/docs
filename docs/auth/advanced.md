import InstallRig from '../../src/markdown/prerequisites/install-rig.md'
import SetupSdk from '../../src/markdown/prerequisites/setup-sdk.md'
import SetupCli from '../../src/markdown/prerequisites/setup-cli.md'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Managing Advanced Settings using the SDK

## Overview

This document provides guidance on managing advanced login settings using the SDK. It covers various settings such as the Time-to-Live (TTL) for codes sent over email or text, as well as options for hashing algorithms. You will learn how to customize these settings according to your specific requirements.

<hr class="solid" />

## Update TTL on Codes

You have the ability to manage the validity duration of access tokens, refresh tokens, and verification codes. This functionality can be valuable for limiting token usage for enhanced security or extending session persistence for longer durations. You can customize these durations based on your specific requirements and preferences.

To manage the Time-to-Live (TTL), you can utilize the `UpdateSettings` endpoint as below:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
if _, err := client.UserSettings().UpdateSettings(ctx, connect.NewRequest(&settings.UpdateSettingsRequest{
    Settings: []*settings.Update{
        {
            Field: &settings.Update_AccessTokenTtl{AccessTokenTtl: durationpb.New(time.Second * 60 * 5)}, // set to 5 minutes
        },
        {
            Field: &settings.Update_RefreshTokenTtl{RefreshTokenTtl: durationpb.New(time.Hour * 24)}, // set to 24 hours
        },
        {
            Field: &settings.Update_VerificationCodeTtl{VerificationCodeTtl: durationpb.New(time.Second * 60 * 10)}, // set to 10 minutes
        },
    },
})); err != nil {
    log.Fatal(err)
}
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
await client.userSettings.updateSettings({
  settings: [
    {
      field: {
        case: "accessTokenTtl",
        value: new Duration({ seconds: 5 * 60 }),
      },
    },
    {
      field: {
        case: "refreshTokenTtl",
        value: new Duration({ seconds: 24 * 60 * 60 }),
      },
    },
    {
      field: {
        case: "verificationCodeTtl",
        value: new Duration({ seconds: 10 * 60 }),
      },
    },
  ],
});
```

</TabItem>
<TabItem value="cli" label="CLI">

In the example provided, the access tokens have a validity of 5 minutes, refresh tokens are valid for 24 hours, and verification codes remain valid for 10 minutes.

It is important to note that when refreshing tokens after the access token has expired, a new pair of refresh and access tokens will be generated with an extended validity period.

```sh
rig user update-settings --field --value
```

Example:

```sh
rig user update-settings -f access-token-ttl -v 5
rig user update-settings -f refresh-token-ttl -v 24
rig user update-settings -f verification-code-ttl -v 10
```

</TabItem>
</Tabs>

<hr class="solid" />

## Update Hashing Algorithm

To update the password hashing algorithm, you can make use of the `UpdateSettings` endpoint. This functionality can be beneficial for security purposes or if you are migrating users from a different provider. By default, the hashing algorithm is set to `Bcrypt` with a cost of `10`. In the example provided below, we illustrate how to update the BCrypt cost to `12`:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
if _, err := client.UserSettings().UpdateSettings(ctx, connect.NewRequest(&settings.UpdateSettingsRequest{
    Settings: []*settings.Update{
        {
            Field: &settings.Update_PasswordHashing{PasswordHashing: &model.HashingConfig{
                Method: &model.HashingConfig_Bcrypt{Bcrypt: &model.BcryptHashingConfig{
                    Cost: 12,
                }},
            }},
        },
    },
})); err != nil {
    log.Fatal(err)
}
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
await client.userSettings.updateSettings({
  settings: [
    {
      field: {
        case: "passwordHashing",
        value: {
          method: {
            case: "bcrypt",
            value: { cost: 12 },
          },
        },
      },
    },
  ],
});
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig user update-settings --field --value
```

Example:

```sh
rig user update-settings -f password-hashing -v '{"bcrypt": {"cost": 12}}'
```

</TabItem>
</Tabs>
