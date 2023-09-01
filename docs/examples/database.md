# Simple Web App backed by a database

We will create a simple webserver backed by a MongoDB database which implements the backend to a cake-rating app.

```bash
mkdir database
cd database
```

and follow the instructions in the guide to [setup the Golang SDK](/sdks).

## Setting up a new MongoDB managed by Rig

We will use Rig to manage our database and do the work through Rig's CLI. Run

```bash
rig database create --name dbname --type mongo
```

This will create a new MongoDB database. Currently, that is the only database we natively support, but Postgres will come soon. Running

```bash
rig database list
```

should output

```
+---------+--------+------------+
| DBS (1) | NAME   |       TYPE |
+---------+--------+------------+
|       1 | dbname | TYPE_MONGO |
+---------+--------+------------+
```

which confirms we have successfully created one. Although it exists, we don't have any credentials on it which means we can't access it yet. Therefore we will add some credentials

```bash
rig database create-credentials
```

and write `dbname` once it prompts you for a DB Identiifer. This should output a new credential e.g.

```
created credential - clientID: rig_a9..., secret: secret_fe...
```

Copy the `clientID` and `secret` somewhere you can find them again, as Rig won't have access to the `secret` again. With this setup, we are ready to write some Go!

## Implementing a backend using the database

Make a `main.go` file in the `database` directory with the basic setup you started with

```go title="main.go"
package main

import (
	"context"
	"fmt"
	"log"

	rig "github.com/rigdev/rig-go-sdk"
)

const (
	_apiKey          = "YOUR_API_KEY"
)

var client rig.Client

func main() {
	client = rig.NewClient()
}
```

Although Rig currently doesn't support Postgres, support will come soon and this example will be built with that in mind. We need some static configuration for the database we want to connect to, specifically the name and the credentials created previously.

```go title="main.go"
type dbConfig struct {
	dbname   string
	username string
	password string
}

var mongoConfig = dbConfig{
    dbname: "dbname",
    username: "YOUR_CLIENT_ID",
    password: "YOUR_SECRET",
}
```

and with that let's try to connect to our DB

```go title="main.go"
func main() {
    client = rig.NewClient()
    ctx := context.Background()

    // When Rig creates a new database it associates to it a UUID. We need this UUID
	dbResponse, err := client.Database().GetByName(ctx, connect.NewRequest(&database.GetByNameRequest{
		Name: mongoConfig.dbname,
	}))
	if err != nil {
		return fmt.Errorf("no database found: %q", err)
	}
    dbUUID := dbResponse.Msg.Database.Id

    // GetEndpoint returns the URI needed to open a connection to the database given by the DatabaseId
    // and username/password supplied by the ClientID and ClientSecret
	endpointResponse, err := client.Database().GetEndpoint(ctx, connect.NewRequest(&database.GetEndpointRequest{
		DatabaseId:   dbUUID,
		ClientID:     mongoConfig.username,
		ClientSecret: mongoConfig.password,
	}))
	if err != nil {
		log.Fatal(fmt.Errorf("failed to get endpoint: %q", err))
	}
    uriToDatabase := endpointResponse.Msg.Endpoint
	fmt.Printf("uri: %s\n", uriToDatabase)

    // Now that we have an URI to the database, we can establish a connection
    mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(uriToDatabase))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongo: %q", err)
	}
    // Although we now have a connection to the database, we need an explicit handle to it
    // This requires us to pass in the name which Rig gave to MongoDB when creating it.
    // This name differs from the `dbname` we called it when constructing it through the Rig CLI
    db := mongoClient.Database(endpointResponse.Msg.DatabaseName)
}
```

This should give us a valid handle to a `*mongo.Database` object interfacing with our database. It's time to use it! The cake-rating app we will build a backend to consists of the following

- A collection of `Images` each having an ELO rating and a URL to an image of the cake. These will be stored in our database.
- An endpoint `addImage` which adds a new image to the collection with a URL an image.
- An endpoint `getPair` which returns a uniformly random pair of two `Images`
- An endpoint `vote` which votes on which of the two cakes (`Images`) is best. This will update the ELO rating of those two `Images`.
- An endpoint `listImages` which dumps the collection of all images

Each of these endpoints is served by a unique database query. We'll encapsulate these queries in a `Repository` interface so we can easily add support for a Postgres backing instead of MongoDB

```go title="main.go"
type Repository interface {
    // The Setup function we use to initially construct the `images` table if it doesn't exist
	Setup(ctx context.Context) error
	AddImage(ctx context.Context, url string) (image, error)
	GetPair(ctx context.Context) ([2]image, error)
	Vote(ctx context.Context, winnerUUID, loserUUID string) error
	ListImages(ctx context.Context) ([]image, error)
}

type image struct {
	Id  string  `json:"id"`
	Url string  `json:"url"`
	Elo float64 `json:"elo"`
}
```

Make a new file `mongo.go` where we'll implement the interface and move the connection logic. For now, we'll just have empty implementations of the interface functions.

```go title="mongo.go"
package main

func newMongoRepository(ctx context.Context, uri string, dbname string) (Repository, error) {
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongo: %q", err)
	}

	return &mongoRepository{
		db: mongoClient.Database(dbname),
	}, nil
}

type mongoRepository struct {
	db *mongo.Database
}

func (m *mongoRepository) Setup(ctx context.Context) error {
    return nil
}

func (m *mongoRepository) AddImage(ctx context.Context, url string) (image, error) {
    return image{}, nil
}

func (m *mongoRepository) GetPair(ctx context.Context) ([2]image, error) {
    var empty [2]image
    return empty, nil
}

func (m *mongoRepository) Vote(ctx context.Context, winnerUUID, loserUUID string) error {
	return nil
}

func (m *mongoRepository) ListImages(ctx context.Context) ([]image, error) {
    return nil, nil
}
```

We also need a couple of changes to `main.go` to accommodate this new `Repository` setup

```go title="main.go"
var client rig.Client
var repo Repository

func main() {
	client = rig.NewClient()
	ctx := context.Background()

    // When Rig creates a new database it associates to it a UUID. We need this UUID
	dbResponse, err := client.Database().GetByName(ctx, connect.NewRequest(&database.GetByNameRequest{
		Name: mongoConfig.dbname,
	}))
	if err != nil {
		return fmt.Errorf("no database found: %q", err)
	}
    dbUUID := dbResponse.Msg.Database.Id

    // GetEndpoint returns the URI needed to open a connection to the database given by the DatabaseId
    // and username/password supplied by the ClientID and ClientSecret
	endpointResponse, err := client.Database().GetEndpoint(ctx, connect.NewRequest(&database.GetEndpointRequest{
		DatabaseId:   dbUUID,
		ClientID:     mongoConfig.username,
		ClientSecret: mongoConfig.password,
	}))
	if err != nil {
		log.Fatal(fmt.Errorf("failed to get endpoint: %q", err))
	}
    uriToDatabase := endpointResponse.Msg.Endpoint
	fmt.Printf("uri: %s\n", uriToDatabase)

    repo, err = newMongoRepository(ctx, uriToDatabase, endpointResponse.Msg.DatabaseName)
    if err != nil {
        log.Fatal("failed to make repository: %q", err)
    }

    if err := repo.Setup(ctx); err != nil {
        log.Fatal("failed to setup database: %q", err)
    }
}
```

The next step is to implement the `Setup` function to create an `images` collection if it doesn't already exist

```go title="mongo.go"
func (m *mongoRepository) Setup(ctx context.Context) error {
	collections, err := m.db.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		return err
	}
	if slices.Contains(collections, "images") {
		return nil
	}
	return m.db.CreateCollection(ctx, "images")
}
```

### Adding an Image

If you have set up the database correctly and passed in the right credentials, running `go run *.go` shouldn't produce any errors. Next, we'll add functionality to add a new `Image` to our collection.

```go title="mongo.go"
func (m *mongoRepository) AddImage(ctx context.Context, url string) (image, error) {
	collection := m.db.Collection("images")
	response, err := collection.InsertOne(ctx, bson.D{
		{Key: "url", Value: url},
		{Key: "elo", Value: 1000}, // We choose a fixed base elo of 1,000
	})
	if err != nil {
		return image{}, err
	}
	oid := response.InsertedID.(primitive.ObjectID)
	return image{
		Id:  oid.String(),
		Url: url,
		Elo: 1000,
	}, nil
}
```

As I'm envisioning this backend to function as a webserver I'll access this `AddImage` function from a request. Before doing that I need a helper function that is purely for ergonomics relating to handling HTTP requests

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

Time to make `main.go` a web server!

```go title="main.go"
func main() {
    // The rest of the function...

    runServer()
}

func runServer() error {
	http.HandleFunc("/addImage", requestWrapper(addImage))

	err := http.ListenAndServe(":3333", nil)
	return err
}

func addImage(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	imgURL := r.URL.Query().Get("imgurl")
	img, err := repo.AddImage(ctx, imgURL)
	if err != nil {
		return err
	}
	w.Write([]byte(img.Id))
	return nil
}
```

The server listens on port `3333` and for now, has a single endpoint `/addImage` which takes a query parameter `imgurl`. One technical thing about passing URLs as a query parameter is that we first need to convert it to an encoding valid for an HTTP request. I usually use [this](https://www.url-encode-decode.com). As an example, I've chosen [this](https://images.pexels.com/photos/3323686/pexels-photo-3323686.jpeg?auto=compress&cs=tinysrgb&w=1600) lovely image. Starting the server by running `go run *.go` I can add the image to our database by going to this address

```
http://localhost:3333/addImage?imgurl=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F3323686%2Fpexels-photo-3323686.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26w%3D1600
```

If everything works as it should the browser should print the ID of the entry in the MongoDB, e.g.

```
ObjectID("64e7473a2e55308c8e677e45")
```

At this point, it is just a matter of implementing the remaining endpoints as they correspond to functions in the `Repository` interface. For those interested, the rest of this article is my implementation.

### List Images

```go title="mongo.go"
func (m *mongoRepository) ListImages(ctx context.Context) ([]image, error) {
	collection := m.db.Collection("images")
	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	var mongoImages []mongoImage
	if err := cur.All(ctx, &mongoImages); err != nil {
		return nil, err
	}

	var images []image
	for _, img := range mongoImages {
		images = append(images, img.toImage())
	}
	return images, nil
}

type mongoImage struct {
	Id  primitive.ObjectID `json:"_id" bson:"_id"`
	Url string             `json:"url" bson:"url"`
	Elo float64            `json:"elo" bson:"elo"`
}

func (m mongoImage) toImage() image {
	return image{
		Id:  m.Id.String(),
		Url: m.Url,
		Elo: m.Elo,
	}
}
```

```go title="main.go"
func runServer() error {
	http.HandleFunc("/addImage", requestWrapper(addImage))
	http.HandleFunc("/listImages", requestWrapper(listImages))

	err := http.ListenAndServe(":3333", nil)
	return err
}

func listImages(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	images, err := repo.ListImages(ctx)
	if err != nil {
		return err
	}
	jsonBytes, err := json.Marshal(&images)
	if err != nil {
		return err
	}
	w.Write(jsonBytes)

	return nil
}
```

After adding a few images, going to `http://localhost:3333/listImages` should display something like

```json
[
  {
    "id": "ObjectID("64e746fd2e55308c8e677e42")",
    "url": "https://preppykitchen.com/wp-content/uploads/2018/04/Funfetti-cake-recipe-new.jpg",
    "elo": 1000
  },
  {
    "id": "ObjectID("64e7470f2e55308c8e677e43")",
    "url": "https://preppykitchen.com/wp-content/uploads/2018/04/Funfetti-cake-recipe-new.jpg",
    "elo": 1000
  },
  {
    "id": "ObjectID("64e748cc2e55308c8e677e47")",
    "url": "https://images.pexels.com/photos/3323686/pexels-photo-3323686.jpeg?auto=compress\u0026cs=tinysrgb\u0026w=1600",
    "elo": 1000
  }
]
```

### Get An Image Pair

```go title="mongo.go"
func (m *mongoRepository) GetPair(ctx context.Context) ([2]image, error) {
	var empty [2]image

	collection := m.db.Collection("images")
	cursor, err := collection.Aggregate(ctx, mongo.Pipeline{
		{
			{
				Key: "$sample",
				Value: bson.D{{
					Key:   "size",
					Value: 2,
				}},
			},
		},
	})
	if err != nil {
		return empty, fmt.Errorf("failed to sample 2: %q", err)
	}

	var mongoImages [2]mongoImage
	if err := cursor.All(ctx, &mongoImages); err != nil {
		return empty, err
	}

	return [2]image{
		mongoImages[0].toImage(),
		mongoImages[1].toImage(),
	}, nil
}
```

```go title="main.go"
func runServer() error {
	http.HandleFunc("/addImage", requestWrapper(addImage))
	http.HandleFunc("/listImages", requestWrapper(listImages))
	http.HandleFunc("/pair", requestWrapper(pair))

	err := http.ListenAndServe(":3333", nil)
	return err
}

func pair(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	images, err := repo.GetPair(ctx)
	if err != nil {
		return err
	}
	jsonBytes, err := json.Marshal(&images)
	if err != nil {
		return err
	}
	w.Write(jsonBytes)
	return nil
}
```

### Vote on an image pair

```go title="mongo.go"
func (m *mongoRepository) Vote(ctx context.Context, winnerUUID, loserUUID string) error {
	winnerID, err := primitive.ObjectIDFromHex(winnerUUID)
	if err != nil {
		return err
	}
	loserID, err := primitive.ObjectIDFromHex(loserUUID)
	if err != nil {
		return err
	}

	collection := m.db.Collection("images")
	var winnerImg image
	if err := collection.FindOne(ctx, bson.M{"_id": winnerID}).Decode(&winnerImg); err != nil {
		return err
	}

	var loserImg image
	if err := collection.FindOne(ctx, bson.M{"_id": loserID}).Decode(&loserImg); err != nil {
		return err
	}

    // Implement proper ELO update calculation
	winnerImg.Elo += 100
	loserImg.Elo -= 100
	if _, err := collection.UpdateByID(ctx, winnerID, bson.M{"$set": bson.M{"elo": winnerImg.Elo}}); err != nil {
		return err
	}
	if _, err := collection.UpdateByID(ctx, loserID, bson.M{"$set": bson.M{"elo": loserImg.Elo}}); err != nil {
		return err
	}

	return nil
}
```

The `vote` endpoint assumes the winner and loser of a vote are given by string UUIDs in the parameters `winner` and `loser`.

```go title="main.go"
func runServer() error {
    // The rest of the function...
	http.HandleFunc("/vote", requestWrapper(vote))

	err := http.ListenAndServe(":3333", nil)
	return err
}

func vote(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	winner := r.URL.Query().Get("winner")
	loser := r.URL.Query().Get("loser")
	return repo.Vote(ctx, winner, loser)
}
```

With this code you should have a very basic backend with a database managed by Rig which can implement a rating app, in this case for cakes :cake:
