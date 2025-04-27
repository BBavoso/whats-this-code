package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var coll *mongo.Collection

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	uri := os.Getenv("MONGODB_URI")

	docs := "www.mongodb.com/docs/drivers/go/current/"
	if uri == "" {
		log.Fatal("Set your 'MONGODB_URI' environment variable. " +
			"See: " + docs +
			"usage-examples/#environment-variable")
	}
	client, err := mongo.Connect(options.Client().
		ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	coll = client.Database("test").Collection("users")

	// Define HTTP routes
	http.HandleFunc("/get-questions", getQuestionsHandler)
	http.HandleFunc("/add-question", addQuestionHandler)

	// Start the server
	log.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Handler to get questions for a specific person
func getQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// // Get the "name" query parameter
	// name := r.URL.Query().Get("name")
	// if name == "" {
	// 	http.Error(w, "Missing 'name' query parameter", http.StatusBadRequest)
	// 	return
	// }

	var payload struct {
		Name string `json:"name"`
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil || payload.Name == "" {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Find the user in the database
	var result bson.M
	filter := bson.M{"name": payload.Name}
	log.Printf("Filter: %+v\n", filter)

	err = coll.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		log.Printf("FindOne error: %v\n", err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Extract questions and send as JSON response
	questions, ok := result["questions"]
	if !ok {
		http.Error(w, "No questions found for the user: "+payload.Name, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(questions)
}

// Handler to add a question for a specific person
func addQuestionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var payload struct {
		Name     string `json:"name"`
		Question string `json:"question"`
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil || payload.Name == "" || payload.Question == "" {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Update the user's questions in the database
	filter := bson.M{"name": payload.Name}
	update := bson.M{"$push": bson.M{"questions": payload.Question}}
	opts := options.UpdateOne().SetUpsert(true)
	res, err := coll.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		http.Error(w, "Failed to update questions", http.StatusInternalServerError)
		return
	}

	if res.UpsertedCount > 0 {
		w.WriteHeader(http.StatusCreated)
		w.Write(([]byte("New user created and question added successfully")))
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Question added successfully"))
	}

}
