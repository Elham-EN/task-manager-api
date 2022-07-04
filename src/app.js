//This file setup the express application

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
app.use(userRouter);

//Express router for task related routes
//(Resgister task router with the express app)
app.use("/tasks", taskRouter);

module.exports = app;
