const express = require("express");
const userRouter = require("./routers/userRoute");
const taskRouter = require("./routers/taskRoute");
const app = express();

//Client send a post request (to create new user) with a JSON
//format data and to access this data we must configure express to
//parse the incoming JSON to JavaScript object automatically and to
//access it in the request object property body.
app.use(express.json());

//Catogorize router by their resource (e.g.: "tasks", "users")
//Combining these two routers togther to create the complete
//express application

//Express router for user related routes
//(Resgister user router with the express app)
app.use("/users", userRouter);

//Express router for task related routes
//(Resgister task router with the express app)
app.use("/tasks", taskRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Express Server is running on port ${port}`);
});

/**
 * Create relationship between task and user models
 * Add user'id field (owner_id) to task schema and a ref option prop
 * in order to create a relation between user model and task model.
 * 
 * Whenever a new task is created, will store the ID of the user who
 * created the task (must be autheticated fire) in user document obj.
 * We can easily fetch the entire user profile whenever we have access
 * to the individual task.
 * 
 * Take owner_id (field property in Task Schema (user_id)) and convert
 * it from being the ID of the owner to being the entire profile/
 * document object of that owner_id.
 * 
 * Populate is going to find the user who is associated with this task
 * and task.owner_id will be the entire document as opposed to just
   being the ID.
 */

//how you can fetch the owner of a given task.
// const task = await Task.findById("5c2e505a3253e18a43e612e6");
// await task.populate("owner").execPopulate();
//how you can fetch the tasks for a given user
// const user = await User.findById('5c2e4dcb5eac678a23725b5b')
// await user.populate('tasks').execPopulate()

/**
 * Now we can use populate to figure out which user created which task
 * or which tasks a user owns. A virtual property is not storing data
 * in the database, it is a relationship between two entities (in this
 * case between the user and the task.) Virtual is not changing what we
 * store for user document. it is just a way for mongoose to figure out
 * how these two things (task & user) are related.
 *
 * first arg is the name for the virtual & second arg we setup an object
 * For populating virtual, we have to specify three necessary options:
 * ref: It contains the name of the model from which we want to populate
 * the document.
 * LocalField: It is any field of the current collection.
 * foreignField: It is any field of the collection from which we want to
 * populate the document.
 *
 * Whenever we want our virtual property to refer to a model of any other
 * collection we have to populate it so that it can contain the document(s)
 * of the other collection.
 *
 * Mongoose will populate those documents from the model given in ref,
 * whose foreignField value will match with the localField value of the
 * current collection.
 *
 * With the relationship configured, tasks can be created with an owner value.
 */

//  UserSchema.virtual("task", {
//   ref: "Task",
//   localField: "_id",
//   foreignField: "owner_id",
// });
