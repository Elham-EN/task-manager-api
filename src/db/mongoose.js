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

//Save user/task instance to the database
const saveInstanceToDatabase = async (instance) => {
  try {
    const result = await instance.save();
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

async function dbFunction(requestData) {
  try {
    //Connect mongoose to mongoDB Database server (running on machine)
    //And create the database "task-manager-api"
    await mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");
    //Models are defined through the Schema interface.
    const UserSchema = createUserSchema(mongoose);
    //Pre middleware function is executed before saving the user document
    // UserSchema.pre("save", async function (next) {
    //   //this - reference to the individual user that is about to be save
    //   const user = this;
    //   if (user.isModified("password"))
    //     user.password = await bcrypt.hash(user.password, 8);
    //   next(); //call next when we are done
    // });
    //Accessing a Model (Creating a model)
    const User =
      //Check if model User exists then use it, else create it
      mongoose.models.User || mongoose.model("User", UserSchema);
    if (requestData.requestInfo === "CREATE_USER") {
      //Create User Object and save to the database
      return await createUserObject(User, requestData);
    }
    if (requestData === "GET_ALL_USERS") {
      const query = {};
      return await User.find(query);
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
