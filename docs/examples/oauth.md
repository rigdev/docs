# User Management with OAuth

We will create a very simple web app showcasing how Rig uses OAuth for user management. For a more complex web app that also revolves around user management but with more complex state handling, see the [TODO-list example](/examples/todo). The example will be written in Go using the Rig Golang SDK. This guide assumes you've gone through our [getting started](/getting-started) and set up Rig on Docker locally. As a first step, create a new empty directory containing our app

```bash
mkdir oauth
cd oauth
```

and follow the instructions in the guide to [setup the Golang SDK](/sdks). You can also clone this example [here](https://github.com/rigdev/oauth-demo).

## Get API Keys and Credentials

Currently, we support OAuth login using Google, Facebook, and Github. To use any of them you first need an API key and credentials from the specific provider. Their respective setup guides are as follows:

- Google: [Create Google OAuth App](https://support.google.com/cloud/answer/6158849?hl=en)
- GitHub: [Create GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- Facebook: [Create Facebook OAuth App](https://developers.facebook.com/docs/development/create-an-app/)

## OAuth-demo setup

Our project will contain a `main.go`, `go.mod`, and `go.sum` files with `main.go` powering the webserver. We will also have a `Dockerfile` so we can make a Docker image and deploy it as a Rig capsule and a frontend implemented in an `index.html` and `index.js`. The file structure will be

```
oauth
├── Dockerfile
├── main.go
├── go.mod
├── go.sum
├── oauth
├───── index.html
└───── index.js
```

Run

```
go get github.com/rigdev/rig-go-sdk
```

to get the go dependencies. Our Dockerfile will contain

```Dockerfile title=Dockerfile
FROM golang:1.20

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

CMD ["go", "run", "./main.go"]
```

In `main.go` which implements our backend we will read the API keys from environment variables

```go title="main.go"
const (
    GOOGLE_OAUTH_PUBLIC_KEY  = os.Getenv("GOOGLE_PUBLIC_KEY")
	GOOGLE_OAUTH_PRIVATE_KEY = os.Getenv("GOOGLE_PRIVATE_KEY")

	FACEBOOK_OAUTH_PUBLIC_KEY  = os.Getenv("FACEBOOK_PUBLIC_KEY")
	FACEBOOK_OAUTH_PRIVATE_KEY = os.Getenv("FACEBOOK_PRIVATE_KEY")

	GITHUB_OAUTH_PUBLIC_KEY  = os.Getenv("GITHUB_PUBLIC_KEY")
	GITHUB_OAUTH_PRIVATE_KEY = os.Getenv("GITHUB_PRIVATE_KEY")
)
```

These environment variables we can configure in our capsule to be automatically setup. To test it we'll for now have a simple `main` function that just prints out the keys.

```go title="main.go"
func main() {
    fmt.Println("Google", GOOGLE_OAUTH_PUBLIC_KEY, GOOGLE_OAUTH_PRIVATE_KEY)
    fmt.Println("Facebook", FACEBOOK_OAUTH_PUBLIC_KEY, FACEBOOK_OAUTH_PRIVATE_KEY)
    fmt.Println("Github", GITHUB_OAUTH_PUBLIC_KEY, GITHUB_OAUTH_PRIVATE_KEY)
```

Let's set up a capsule, deploy it, and see that we can read in these variables. Run

```bash
rig capsule create --name oauth-demo
```

Now that we have a capsule we can set environment variables for it in the Rig dashboard accessible on `localhost:4747`. Navigate to the `Settings` tab the `oauth-demo` capsule and set environment variables like this
![image](https://i.imgur.com/Uf6f2bV.png)
After these changes are saved we'll make a Docker image with our application and deploy it to the capsule

```bash
docker build -t oauth-demo .
rig capsule create-build oauth-demo --image oauth-demo --deploy
```

If all this works, the capsule should print out the API credentials. Inspect the logs with

```
rig capsule logs oauth-demo
```

## Using the Rig client

Using the `rig.Client` we can access all the modules of Rig, including the User module which we'll use for OAuth authentication. The client requires some credentials to be able to communicate with the Rig backend. These can be automatically injected into the capsule as environment variables by running the following command

```bash
rig capsule config oauth-demo --auto-add-service-account
```

Starting from a clean `func main()` we now have the credentials to update Rig's OAuth settings to configure the API keys and

```go title="main.go"
var client rig.Client

func main() {
	client = rig.NewClient()
	ctx := context.Background()
	_, err := client.UserSettings().UpdateSettings(ctx, connect.NewRequest(&settings.UpdateSettingsRequest{
		Settings: []*settings.Update{
			{
				Field: &settings.Update_OauthProvider{
					OauthProvider: &settings.OauthProviderUpdate{
						Provider: model.OauthProvider_OAUTH_PROVIDER_GOOGLE,
						Credentials: &model.ProviderCredentials{
							PublicKey:  GOOGLE_OAUTH_PUBLIC_KEY,
							PrivateKey: GOOGLE_OAUTH_PRIVATE_KEY,
						},
						AllowLogin:    true,
						AllowRegister: true,
					},
				},
			},
			{
				Field: &settings.Update_OauthProvider{
					OauthProvider: &settings.OauthProviderUpdate{
						Provider: model.OauthProvider_OAUTH_PROVIDER_FACEBOOK,
						Credentials: &model.ProviderCredentials{
							PublicKey:  FACEBOOK_OAUTH_PUBLIC_KEY,
							PrivateKey: FACEBOOK_OAUTH_PRIVATE_KEY,
						},
						AllowLogin:    true,
						AllowRegister: true,
					},
				},
			},
			{
				Field: &settings.Update_OauthProvider{
					OauthProvider: &settings.OauthProviderUpdate{
						Provider: model.OauthProvider_OAUTH_PROVIDER_GITHUB,
						Credentials: &model.ProviderCredentials{
							PublicKey:  GITHUB_OAUTH_PUBLIC_KEY,
							PrivateKey: GITHUB_OAUTH_PRIVATE_KEY,
						},
						AllowLogin:    true,
						AllowRegister: true,
					},
				},
			},
			{
				Field: &settings.Update_CallbackUrls_{
					CallbackUrls: &settings.Update_CallbackUrls{
						CallbackUrls: []string{"http://localhost:3333/userPage"},
					},
				},
			},
		},
	}))
	if err != nil {
		log.Fatal(err)
	}
```

This enables Google, Facebook, and Github OAuth authentication with all three being allowed to create new users and log in existing ones. The last update element sets the list of callback URLs which we allow the OAuth providers to redirect the users to after logging in. Our Oauth demo application will expose a `userPage` endpoint on port `3333` which we'll redirect users to after logging in.

You can redeploy the capsule and inspect the logs in the same way we did previously.

After updating the settings for the OAuth providers we can list them and get a login link for each of them with a callback URL. The `GetAuthConfig` function on the `rig.Client` requires the ID of the project the capsule runs in. Within a capsule, this ID is automatically stored in the `RIG_PROJECT_ID` environment variable for us to read.

```go title="main.go"
var _projectID = os.Getenv("RIG_PROJECT_ID")

func main() {
    // The rest of the function

    authConfigResp, err := client.Authentication().GetAuthConfig(ctx, connect.NewRequest(&authentication.GetAuthConfigRequest{
		RedirectAddr: "http://localhost:3333/userPage",
        ProjectId: _projectID,
	}))
	if err != nil {
		log.Fatal(err)
	}
	for _, provider := range authConfigResp.Msg.GetOauthProviders() {
		fmt.Println(provider)
		fmt.Println("")
	}
}
```

This will print something of the form

```txt title="stdout"
name:"Github" provider_url:"https://github.com/login/oauth/authorize?client_id=...."

name:"Google" provider_url:"https://accounts.google.com/o/oauth2/auth?client_id=..."

name:"Facebook" provider_url:"https://www.facebook.com/v3.2/dialog/oauth?client_id=..."
```

Clicking on any of the links takes you to the corresponding provider's login page. After a successful login you should be redirected to the URL specified in the `RedirectAddr` we passed when accessing the `AuthConfig`. The redirect URL will have two query parameters, `access_token=...` and `refresh_token=...`. The `access_token` has a Time-To-Live of 60 minutes. These tokens we will use when authenticating the user up against Rig.

We will make a small website example where we start with a login screen and then redirect the user to a page with a little bit of data localized to each specific user and accessed through the tokens.
For convenience's sake, I also use a helper function for handling HTTP requests. It is purely for ergonomic reasons and is not related to Rig in any way.

```go title="main.go"
// requestWrapper wraps a http request handler which uses a Context and returns an error to a function with the standard header
func requestWrapper(handler func(ctx context.Context, w http.ResponseWriter, r *http.Request) error) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		if err := handler(ctx, w, r); err != nil {
			fmt.Printf("error: %s\n", err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
		}
	}
}
```

Let's set up a small webserver in our `main` function, a basic web page defined by `index.html` and a javascript file `index.js` in an `oauth` subfolder. The file structure should be

```
oauth
├── Dockerfile
├── main.go
├── go.mod
├── go.sum
├── oauth
├───── index.html
└───── index.js
```

```go title="main.go"
func main() {
    // The rest of the function...

	if err := runServer(); err != nil {
		log.Fatal(err)
	}
}

func runServer() error {
	http.Handle("/", http.FileServer(http.Dir("./oauth/")))

    http.HandleFunc("/login", requestWrapper(login))

	err := http.ListenAndServe(":3333", nil)
	return err
}

func login(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	providerName := r.URL.Query().Get("provider")
	authConfigResp, err := client.Authentication().GetAuthConfig(ctx, connect.NewRequest(&authentication.GetAuthConfigRequest{
		RedirectAddr: "http://localhost:3333/userPage",
		ProjectId:    _projectID,
	}))
	if err != nil {
		return err
	}

	for _, provider := range authConfigResp.Msg.OauthProviders {
		if provider.Name == providerName {
			w.Write([]byte(provider.ProviderUrl))
			return nil
		}

	}

	return errors.New("unknown OAuth2 provider")
}
```

The web server will listen on port `3333` and besides providing an html and javascript file, it has a single endpoint `login`. `login` takes a query parameter `provider` which can be one of `Google`, `Facebook`, and `Github`. We load the OAuth configuration for all providers, and if the `provider` is one of the configured ones, we return the `ProviderURL` which takes a user to the corresponding login page.

```html title="oauth/index.html"
<html>
  <head>
    <title>OAuth</title>
    <script src="/js"></script>
  </head>

  <body>
    <input type="button" value="Log in with Google" id="Google" />
    <input type="button" value="Log in with GitHub" id="Github" />
    <input type="button" value="Log in with Facebook" id="Facebook" />
  </body>
</html>
```

The HTML page is simply three different buttons, one for each provider. Clicking one of them should call the `login` endpoint and redirect the user to the `ProviderURL` to prompt them to log in.

```javascript title="oauth/index.js"
window.addEventListener("load", () => {
  let providers = ["Google", "Github", "Facebook"];
  for (let provider of providers) {
    let button = document.getElementById(provider);
    button.onclick = () => providerLogin(provider);
  }
});

async function providerLogin(provider) {
  let url = `http://localhost:3333/login?provider=${provider}`;
  try {
    let resp = await fetch(url);
    let providerURL = await resp.text();
    location.href = providerURL;
  } catch (error) {
    console.log(error);
  }
}

let params = new URL(document.location).searchParams;
console.log(params);
```

We add an `onclick` listener to each of the three buttons, calling the `login` endpoint with the `provider` query parameter set according to the button being pressed.
Then if the `login` request succeeded, we redirect the user to the returned URL.

Besides redeploying the capsule with the code changes, we need to expose the `3333` port to the public as by default ports on which a capsule listens are not publicly available. You can do this under the `Network` tab on the capsules page in the dashboard and should have the following settings
![image](https://github.com/rigdev/oauth-demo/assets/24476600/d025a238-5269-435e-a8f3-38e1dca23e90)
We expose port 3333 and add an authorization middleware to two new endpoints which we'll add later (`/updateData` and `/getData`). These two endpoints require a user login to access.

If you have redeployed and updated the networking settings you should be able to view the landing page with the three login buttons on `localhost:3333/`. The login buttons should work and after a successful login, redirect you to `localhost:3333/userPage`. The `userPage` is not implemented yet, so loading it is expected to fail.

## Userpage with user-specific data

Our `userPage` will be a simple page displaying a little bit of data unique to the user and we'll add the ability to update this data. Make two new files `oauth/userpage.html` and `oauth/userpage.js`, resulting in the file structure

```
oauth
├── Dockerfile
├── main.go
├── go.mod
├── go.sum
├── oauth
├───── index.html
└───── index.js
├───── userpage.html
└───── userpage.js
```

With this setup, executing `go run main.go` in the `oauth` folder should start a webserver listening on `http://localhost:3333/` displaying three buttons. Clicking one of them should redirect to a provider-specific login page. The next step is to add a `userPage` which we will display should the login succeed. We need two new files `userpage.html` and `userpage.js` given the following file structure

```
oauth
├── main.go
├── index.html
├── index.js
├── userpage.html
└── userpage.js
```

Then add

```html title="oauth/userpage.html"
<html>
  <head>
    <title>OAuth</title>
    <script src="/userpageJS"></script>
  </head>

  <body>
    <h1>You are logged in!</h1>
    <b>User data</b>
    <p id="userdata"></p>
    <input type="text" id="input" />
    <input type="button" id="button" value="Update user data" />
  </body>
</html>
```

This displays a message telling you that you are logged in and contains a text field with a submit button. Text submitted here will become the user-specific data only accessible by the user being logged in.

```javascript title="oauth/userpage.js"
let params = new URL(document.location).searchParams;
let accessToken = params.get("access_token");
let refreshToken = params.get("refresh_token");
console.log({ accessToken: accessToken, refreshToken: refreshToken });
```

For now, we simply retrieve the access and refresh tokens from the URL parameters and log them in the console to make sure we correctly read them. If you rebuild- and deploy the capsule, login on `http://localhost:3333`, you can (hopefully) witness the new `userpage`!. The browser console should show a log statement of the form

```json
{ "accessToken": "ey...", "refreshToken": "ey..." }
```

as well.

The text field and submit button are functionless at the moment. The last thing will be to complete their functionality. We will add two new endpoints in the backend `updateData` and `getData`. `updateData` stores user-specific data (just plain text here) and `getData` fetches it. User authorization will be handled by the authorization middleware we added earlier when we updated the Network settings. The middleware adds a `X-Rig-User-ID` header with a user ID of the user associated with the previous access token

```go title="main.go"
func runServer() {
    // The rest of the function...

	http.HandleFunc("/updateData", requestWrapper(updateData))
	http.HandleFunc("/getData", requestWrapper(getData))
}


func getData(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
    userID, err := uuid.Parse(r.Header.Get("X-Rig-User-ID"))
	if err != nil {
		return fmt.Errorf("failed to authenticate: %q", err)
	}
	userResp, err := client.User().Get(ctx, connect.NewRequest(&user.GetRequest{
		UserId: userID,
	}))
	dataBytes := userResp.Msg.User.Metadata["data"]
	w.Write(dataBytes)

	return nil
}

func updateData(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
    userID, err := uuid.Parse(r.Header.Get("X-Rig-User-ID"))
	if err != nil {
		return fmt.Errorf("failed to authenticate: %q", err)
	}
	data := r.Header.Get("data")
	if _, err = client.User().Update(ctx, connect.NewRequest(&user.UpdateRequest{
		UserId: userID,
		Updates: []*user.Update{{
			Field: &user.Update_SetMetadata{
				SetMetadata: &model.Metadata{
					Key:   "data",
					Value: []byte(data),
				},
			},
		}},
	})); err != nil {
		return err
	}

	return nil
}
```

There are multiple ways to associate data to specific users (e.g. a custom database table), but for now, we'll utilize a generic `map[string][]byte` map called `Metadata` which is stored with each Rig user. `getData` reads from this `Metadata` field and `updateData` writes to it whatever was written in the `data` header.

Then we hook up the `Submit` button to the `updateData` endpoint and also call `getData` when logging in to display the user-specific data. The authorization middleware expects a [JWT](https://jwt.io/introduction) with the Bearer schema

```javascript title="oauth/userpage.js"
window.addEventListener("load", () => {
  let submitButton = document.getElementById("button");
  submitButton.onclick = () => updateUserData();

  getData();
});

async function getData() {
  let userDataEl = document.getElementById("userdata");
  try {
    let resp = await fetch("http://localhost:3333/getData", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    let text = await resp.text();
    userDataEl.innerText = text;
  } catch (e) {
    console.log(e);
  }
}

async function updateUserData() {
  let text = document.getElementById("input").value;
  let userDataEl = document.getElementById("userdata");
  let url = "http://localhost:3333/updateData";
  try {
    await fetch(url, {
      headers: {
        Authorization: "Bearer " + accessToken,
        data: text,
      },
    });
    userDataEl.innerText = text;
  } catch (e) {
    console.log(e);
  }
}
```

With these additions, redeploy the capsule, try and login with different users, and add some data. You should see that the data on the page is user-specific and persists over time.

This concludes this basic example of how to set up OAuth for user creation/login, using it in a simple web app, and persisting user-specific data.
