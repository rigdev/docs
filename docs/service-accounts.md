---
sidebar_position: 1
pagination_next: null
pagination_prev: null
---

import ThemedImage from '@theme/ThemedImage';

# Service Accounts

Service Accounts are be used to authenticate and identify your application and Rig project against the Rig backend. Service accounts can also automatically be created and injected into your Rig Capsules as environment variables allowing your capsules to authenticate against the Rig backend.

<hr class="solid" />

## Create Service Accounts

Service Accounts for external use are created through the dashboard and can be found under your project settings as seen below:

<ThemedImage
  alt="Dashboard Service Account Image"
  sources={{
    light: '/img/service-account/no-service-account.png',
    dark: '/img/service-account/no-service-account.png',
  }}
/>

Click on the **Add Service Account** and provide a name. Afterward, you will see the success screen with your new service account:

<ThemedImage
  alt="Dashboard Service Account Image"
  customProps={{
    zoom: true
  }}
  sources={{
    light: '/img/service-account/service-account-created.png',
    dark: '/img/service-account/service-account-created.png',
  }}
/>

**Remember to copy the `Client Secret` as this is the first and last time you will be able to**.

You can now [setup the SDK](/sdks) using your client credential!
