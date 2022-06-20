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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const myFunction = async () => {
//   const passwordPlainText = "soranXD555";
//   //Hashing algorthim by the design are not reversible (there is
//   //no way to get the plain text version once we hashed it)
//   const hashedPassword = await bcrypt.hash(passwordPlainText, 8);
//   console.log("====================================");
//   console.log(hashedPassword);
//   console.log("====================================");
//   const isMatch = await bcrypt.compare("soranXD555", hashedPassword);
//   console.log("====================================");
//   console.log(isMatch);
//   console.log("====================================");
// };
// myFunction();
