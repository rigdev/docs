# TODO-list example

We will create a simple TODO list web app with user authentication showcasing how Rig operates with users. The app will be written in Go using the Rig Golang SDK. This guide assumes you've gone through our [getting started](/getting-started) and set up Rig on Docker locally. After that, create a new empty directory containing our app

```bash
mkdir todo
cd todo
```

and follow the instructions in the guide to [setup the Golang SDK](/sdks). You can also clone this example [here](https://github.com/rigdev/todo-demo)

## Simple TODO-list setup

Our project will contain a `main.go`, `go.mod` and `go.sum` files with `main.go` powering the webserver. We will also have a `Dockerfile` so we can make a Docker image and deploy it as a Rig capsule and a frontend implemented in an `index.html` and `index.js`. The file structure will be

```
todo
├── Dockerfile
├── main.go
├── go.mod
├── go.sum
├── todo
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

Our frontend is a simple HTML site

```html title="todo/index.html"
<html>
  <head>
    <title>TODO List - powered by Rig</title>
    <script src="/index.js"></script>
  </head>

  <body>
    <h1>Log In or Create User</h1>
    <form id="login">
      <label for="username">Username</label><br />
      <input type="text" id="username" name="username" /><br />
      <label for="password">Password</label><br />
      <input type="text" id="password" name="password" /><br />
      <br />
      <input type="button" value="Log In" id="loginButton" />
      <input type="button" value="Create User" id="createUserButton" />
      <input id="logout" value="Log Out" type="button" />
    </form>
    <p id="loginstatus">Not logged in</p>
    <hr />

    <h1>Items</h1>
    <ul id="items"></ul
    <form id="addItem">
      <span>
        <input type="text" id="value" name="New Item" style="display:inline" />
        <input
          type="button"
          value="Add New Item"
          id="addItemButton"
          style="display:inline"
        />
      </span>
    </form>
    <hr />
  </body>
</html>
```

It'll show a form for creating users and logging, and a list of items below to which you can add new items. `index.js` will be empty for now.

In `main.go` We'll start by creating a helper function for our web server. It is not essential but simply for ergonomic purposes not relating to Rig

```go title="main.go"
// requestWrapper wraps a http request handler which uses a Context and returns an error to a function with the standard header
func requestWrapepr(handler func(ctx context.Context, w http.ResponseWriter, r *http.Request) error) func(w http.ResponseWriter, r *http.Request) {
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

Starting from a clean `main` function we'll initialize our `rig.Client` and start our server

```go title="main.go"
var client rig.Client

func main() {
	client = rig.NewClient()
	if err := runServer(); err != nil {
		log.Fatal(err)
	}
}

func runServer() error {
    http.Handle("/", http.FileServer(http.Dir("./todo/")))

	err := http.ListenAndServe(":3333", nil)
	return err
}
```

We will need the `client` object for most of the requests to the backend, thus we'll define a global `client` object that will be re-used across requests. The `client` is thread-safe.

## Deploying as a Rig capsule

We will run the web app by deploying it as a Rig capsule running locally. This also allows us to easier integrate with the Rig authorization workflow. Start by making a new capsule

```bash
rig capsule create todo-demo
```

Then make a Docker image of the TODO demo

```bash
docker build -t todo-demo .
```

This we will deploy to our new `todo-demo` capsule

```bash
rig capsule create-build todo-demo --image todo-demo --deploy
```

Now we should have `todo-demo` running locally which we can verify by running `docker ps`

```bash
> docker ps
CONTAINER ID   IMAGE                            COMMAND                  CREATED         STATUS                 PORTS                                            NAMES
0294f8e4d7bc   todo-demo:latest                 "go run ./main.go"       2 seconds ago   Up 1 second                                                             todo-demo-instance-0
```

The `rig.Client` expects credentials to be present in the environment variables `RIG_CLIENT_ID` and `RIG_CLIENT_SECRET`. We can automatically inject these in our capsule by running

```bash
rig capsule config todo-demo --auto-add-service-account
```

Although our web server is listening on port 3333, this port is not exposed to the public. We can expose it as a public port through the Rig dashboard under your capsule's Networks tab.
Besides making the port public, we add an authentication middleware that ensures requests have proper authentication unless the endpoint has been specifically allowed unauthorized.
![image](https://i.imgur.com/rBzd1af.png)

In particular, the `/` endpoint needs no authentication and you should be able to go to `http://localhost:3333/` and see the simple webpage served by `index.html`

![image](https://i.imgur.com/2d565YV.png)

## Creating users

Our next step is to make an endpoint that allows the creation of new users. The endpoint `createUser` expects a `username` and `password` field in the request header and will return the `access_token` and `refresh_token` we later can use for authenticating this new user.
The `Register` function on the `rig.Client` requires the ID of the project in which the capsule is run. Within a capsule, this is automatically stored in the `RIG_PROJECT_ID` environment variable.

```go title="main.go"

var _projectId = os.Getenv("RIG_PROJECT_ID")

func createUser(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	fmt.Println("createUser")

	username := r.Header.Get("username")
	password := r.Header.Get("password")
    response, err := client.Authentication().Register(ctx, connect.NewRequest(&authentication.RegisterRequest{
		Method: &authentication.RegisterRequest_UserPassword{
			UserPassword: &authentication.UserPassword{
				Password: password,
				Identifier: &model.UserIdentifier{Identifier: &model.UserIdentifier_Username{
					Username: username,
				}},
                ProjectId: _projectID,
			},
		},
	}))
    if err != nil {
        return err
    }

	bytes, err := makeTokenResponseBytes(response.Msg.Token)
	if err != nil {
		return err
	}
	w.Write(bytes)
	return nil
}

func makeTokenResponseBytes(token *authentication.Token) ([]byte, error) {
	response := map[string]string{
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
	}
	return json.MarshalIndent(response, "", " ")
}

func runServer() error {
    http.Handle("/", http.FileServer(http.Dir("./todo/")))

    http.HandleFunc("/createUser", requestWrapper(createUser))

	err := http.ListenAndServe(":3333", nil)
	return err
}
```

We can hook up our new endpoint to the `Create User` button using a bit of JavaScript.

```javascript title="index.js"
let accessToken = "";
let refreshToken = "";
let username = "";

async function createUser() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  let url = "/createUser";
  const response = await fetch(url, {
    headers: {
      username: user,
      password: pass,
    },
  });
  if (response.status != 200) {
    alert(await response.text());
    return;
  }

  const json = await response.json();
  console.log(json);
  accessToken = json.access_token;
  refreshToken = json.refresh_token;
  updateLogin(user);
}

function updateLogin(newUsername) {
  username = newUsername;
  document.getElementById("loginstatus").innerText = isLoggedIn()
    ? `Logged In as '${username}'`
    : "Logged Out";
}

function isLoggedIn() {
  return username != "";
}

window.addEventListener("load", () => {
  let createUserButton = document.getElementById("createUserButton");
  createUserButton.onclick = () => createUser();
});
```

Redeploy the server

```bash
docker build -t todo-demo .
rig capsule create-build todo-demo --image todo-demo --deploy
```

Fill out the login form, click `Create User` and the web console should print the tokens e.g.

```json
{
  "access_token": "ey...",
  "refresh_token": "ey..."
}
```

## Logging in

Besides creating users we want to be able to log in to existing ones. We do this in almost the same way in a new endpoint `login`. This endpoint also expects a `username` and `password` field in the request header and will return a token pair (if the username and password correspond to an already existing user).

```go title="main.go"
func login(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	fmt.Println("login")
	username := r.Header.Get("username")
	password := r.Header.Get("password")
	resp, err := client.Authentication().Login(ctx, connect.NewRequest(&authentication.LoginRequest{
		Method: &authentication.LoginRequest_UserPassword{
			UserPassword: &authentication.UserPassword{
				Identifier: &model.UserIdentifier{
					Identifier: &model.UserIdentifier_Username{
						Username: username,
					},
				},
				Password: password,
                ProjectId: _projectID,
			},
		},
	}))
	if err != nil {
		return fmt.Errorf("failed to login: %q", err)
	}

	bytes, err := makeTokenResponseBytes(resp.Msg.Token)
	w.Write(bytes)
	return nil
}

func runServer() error {
    // The rest of the function...

    http.HandleFunc("/login", RequestWrapper(login))

	err := http.ListenAndServe(":3333", nil)
	return err
}
```

Lastly, we'll have to hook the `Log In` button up to the `login` endpoint

```javascript title="index.js"
async function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  let url = "/login";
  const response = await fetch(url, {
    headers: {
      username: user,
      password: pass,
    },
  });
  if (response.status != 200) {
    alert(await response.text());
    return;
  }

  const json = await response.json();
  console.log(json);
  accessToken = json.access_token;
  refreshToken = json.refresh_token;
  updateLogin(user);
}

window.addEventListener("load", () => {
  let loginForm = document.getElementById("loginButton");
  loginForm.onclick = () => login();

  let createUserButton = document.getElementById("createUserButton");
  createUserButton.onclick = () => createUser();
});
```

Now you can either create a new user or login to an existing one. If you either try to create a user with an already existing username or to login with a wrong password, an error will be returned.

## Adding items to a user's TODO list

A user will have a list of `items` associated with it, with each item having a `value` and a `checked` field. Let's make a new endpoint that sets the items for a specific user given by the access/refresh tokens returned by the `createUser` or `login` endpoint. The tokens are JWTs.
Our `updateItems` endpoint expects the tokens to be passed in the request header, and the request body will contain a JSON string of a list of items, e.g. `[{"value": "somevalue", "checked": false}]`.
There are multiple ways we could store data for a specific user, e.g. in a custom database table. I chose a simpler solution for convenience's sake. Each Rig user has an associated `Metadata` object of type `map[string][]byte` in which we will store our `items`. When we authenticate a token pair (and if the authentication is successful), the `client` returns a UUID for the user the tokens refer to. This UUID we can then use to retrieve and update the user's `Metadata` object.

```go title="main.go"
type item struct {
	Value   string `json:"value"`
	Checked bool   `json:"checked"`
}

func updateItems(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	fmt.Println("updateItems")

	userID, err := uuid.Parse(r.Header.Get("X-Rig-User-ID"))
	if err != nil {
		return fmt.Errorf("failed to authenticate: %q", err)
	}

	itemsBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}

	if _, err := client.User().Update(ctx, connect.NewRequest(&user.UpdateRequest{
		UserId: userID.String(),
		Updates: []*user.Update{{
			Field: &user.Update_SetMetadata{
				SetMetadata: &model.Metadata{
					Key:   _itemsKey,
					Value: itemsBytes,
				},
			},
		}},
	})); err != nil {
		return err
	}

	return nil
}

func runServer() error {
    // The rest of the function...

    http.HandleFunc("/updateItems", RequestWrapper(updateItems))

	err := http.ListenAndServe(":3333", nil)
	return err
}
```

Lastly, we need to hook up the `Add New Item` button to the `updateItems` endpoint

```javascript title="index.js"
let items = [];

async function addItem() {
  let valueElement = document.getElementById("value");
  let value = valueElement.value;
  valueElement.value = "";
  items.push({ value: value, checked: false });

  await updateItems();
}

async function updateItems() {
  if (!isLoggedIn()) return;
  url = "/updateItems";
  let response = await fetch(url, {
    method: "POST",
    headers: {
      access_token: accessToken,
      refresh_token: refreshToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(items),
  });
  if (response.status != 200) {
    alert(await response.text());
    return;
  }
}

window.addEventListener("load", () => {
  let addItemForm = document.getElementById("addItemButton");
  addItemForm.onclick = () => addItem();

  let loginForm = document.getElementById("loginButton");
  loginForm.onclick = () => login();

  let createUserButton = document.getElementById("createUserButton");
  createUserButton.onclick = () => createUser();
});
```

Hopefully writing something in the text field under `Items`` and clicking the `Add New Item` button doesn't return an error, but we still have no way of seeing which items are stored for a particular user.

## Getting a user's items

The next endpoint we'll add is for returning the list of items stored for a given user. The `items` endpoint also expects the `accessToken` and `refreshToken` to be supplied in the request header for authentication.

```go title="main.go"
func items(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	fmt.Println("items")

	uuid, err := AuthenticateUserFromRequest(ctx, r)
	if err != nil {
		return fmt.Errorf("failed to authenticate: %q", err)
	}

	resp, err := client.User().Get(ctx, connect.NewRequest(&user.GetRequest{
		UserId: uuid,
	}))
	if err != nil {
		return fmt.Errorf("failed to get user info: %q", err)
	}

	metadata := resp.Msg.User.Metadata
	itemsBytes, ok := metadata["items"]
	if !ok {
		itemsBytes, _ = json.Marshal([]item{})
	}

	w.Write(itemsBytes)

	return nil
}

func runServer() error {
    // The rest of the function...

    http.HandleFunc("/items", RequestWrapper(items))

	err := http.ListenAndServe(":3333", nil)
	return err
}
```

Next, we'll call this endpoint when we login and when we update the items, to validate that things are stored and retrieved correctly.

```javascript title="index.js"
async function getItems() {
  if (!isLoggedIn()) return;
  let url = "/items";
  const response = await fetch(url, {
    headers: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
  if (response.status != 200) {
    alert(await response.text());
    return;
  }
  return await response.json();
}
```

and add

```javascript
console.log(await getItems());
```

at the bottom of the `updateItems` and `login` functions to see that we fetch the items we expect. With these additions and adding a few items you should see something like

```javascript
[
  { value: "item1", checked: false },
  { value: "item2", checked: false },
];
```

In the javascript console. You can play around with adding items to a user, refreshing the page (effectively logging out), and then logging in again. You should see the same list of items logged in the console.
At last, let's display the items as HTML elements in a simple `<ul>` tag.

```javascript title="index.js"
function buildItemsElement() {
  let itemsUL = document.getElementById("items");
  while (itemsUL.firstChild) {
    itemsUL.removeChild(itemsUL.firstChild);
  }
  for (let idx = 0; idx < items.length; idx++) {
    let item = items[idx];
    let li = document.createElement("li");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.onchange = (event) => checkboxOnChange(item, event);
    li.appendChild(checkbox);

    let p = document.createElement("p");
    p.innerText = item.value;
    p.style = "display:inline";
    li.appendChild(p);

    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "Delete";
    deleteButton.onclick = () => deleteButtonOnClick(idx);
    li.appendChild(deleteButton);

    itemsUL.appendChild(li);
  }
}
```

`buildItemsElement` we'll call whenever we update the `items` variable. I've added callbacks for the `Delete` button and the checkboxes on the items, so we'll better implement those as well.

```javascript title="index.js"
async function deleteButtonOnClick(itemIdx) {
  items.splice(itemIdx, 1);
  await updateItems();
  buildItemsElement();
}

async function checkboxOnChange(item, event) {
  item.checked = event.target.checked;
  await updateItems();
}
```
