const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const createUserSchema = require("./models/User");
const createTaskSchema = require("./models/Task");

//Creating Instance of User
const createUserObject = async (userModel, requestData) => {
  const user = new userModel({
    name: requestData.name,
    age: requestData.age,
    email: requestData.email,
    password: requestData.password,
  });
  try {
    return await saveInstanceToDatabase(user);
  } catch (error) {
    throw new Error(error.message);
  }
};

//Creating Instance of Task
const createTaskObject = async (taskModel, requestData) => {
  const task = new taskModel({
    description: requestData.description,
    completed: requestData.completed,
  });
  try {
    return await saveInstanceToDatabase(task);
  } catch (error) {
    throw new Error(error.message);
  }
};

//Save user/task instance to the database
const saveInstanceToDatabase = async (instance) => {
  try {
    const result = await instance.save();
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

//Fetch user document by valid credentials
//(Authentication - Who you say you are?)
async function findByCredentials(User, requestBody) {
  const email = requestBody.email;
  const password = requestBody.password;
  //Find user with that email
  const user = await User.findOne({ email });
  //If there was no user with that email
  if (!user) throw new Error("Unable to login (Invalid Email)");
  //Find user with that password by matching
  const isMatch = await bcrypt.compare(password, user.password);
  //If password does not match the password from the database
  if (!isMatch) throw new Error("Unable to login (Invalid Password)");
  //User is found with valid credentials
  return user;
}

async function dbFunction(requestData) {
  try {
    //Connect mongoose to mongoDB Database server (running on machine)
    //And create the database "task-manager-api"
    await mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");
    //Models are defined through the Schema interface.
    const UserSchema = createUserSchema(mongoose);
    //Accessing a Model (Creating a model)
    const User =
      //Check if model User exists then use it, else create it
      mongoose.models.User || mongoose.model("User", UserSchema);
    if (requestData.requestInfo === "CREATE_USER") {
      //Create User Object and save to the database
      return await createUserObject(User, requestData);
    }
    if (requestData === "GET_ALL_USERS") {
      return await User.find({});
    }
    if (requestData.requestInfo === "GET_USER") {
      //Mongoose automatically convert string _id to object ObjectId
      return await User.findById(requestData._id);
    }
    if (requestData.requestInfo === "UPDATE_USER") {
      return await User.findByIdAndUpdate(
        requestData._id,
        requestData.body, //{name: "Hinata"}
        //Return the modified document rather than the original
        //Run validation for the update document. (validate the update
        //operation against the model's schema)
        { new: true, runValidators: true }
      );
    }
    if (requestData.requestInfo === "DELETE_USER") {
      return await User.findByIdAndDelete(requestData._id);
    }
    if (requestData.requestInfo === "LOGIN_USER") {
      return await findByCredentials(User, requestData.requestBody);
    }
    const TaskSchema = createTaskSchema(mongoose);
    const Task =
      mongoose.models.Task || mongoose.model("Task", TaskSchema);
    if (requestData.requestInfo === "CREATE_TASK") {
      return await createTaskObject(Task, requestData);
    }
    if (requestData === "GET_ALL_TASKS") {
      const query = {};
      return await Task.find(query);
    }
    if (requestData.requestInfo === "GET_TASK") {
      return await Task.findById(requestData._id);
    }
    if (requestData.requestInfo === "UPDATE_TASK") {
      return await Task.findByIdAndUpdate(
        requestData._id,
        requestData.body,
        { new: true, runValidators: true }
      );
    }
    if (requestData.requestInfo === "DELETE_TASK") {
      return await Task.findByIdAndDelete(requestData._id);
    }
  } catch (error) {
    throw new Error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

module.exports = dbFunction;
