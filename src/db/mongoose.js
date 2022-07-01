const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jtw = require("jsonwebtoken");
const createUserSchema = require("./models/User");
const createTaskSchema = require("./models/Task");

//Creating Instance of User (Register/SignUp User) (will also
//generated token and return authentication token) Once user
//sign up, they don't need to provide crediential (log in)
const createUserObject = async (userModel, requestData) => {
  let user = new userModel({
    name: requestData.name,
    age: requestData.age,
    email: requestData.email,
    password: requestData.password,
  });
  try {
    user = await saveInstanceToDatabase(user);
    const token = generateAuthToken(user);
    user.tokens = user.tokens.concat({ token: token });
    await user.save(); //Save token to the database
    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
};

//Creating Instance of Task
const createTaskObject = async (taskModel, requestBody, userId) => {
  const task = new taskModel({
    ...requestBody,
    //Create assoication between authenticated user and task
    owner_id: userId,
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
  //User is found with valid credentials and generate a token
  const token = generateAuthToken(user);
  //merge two or more arrays. This method does not change the existing
  //arrays, but instead returns a new array.
  user.tokens = user.tokens.concat({ token: token });
  await user.save(); //Save token to the database
  return { user, token };
}

/**
 * JWTs are a good way of securely transmitting information between parties
 * because they can be signed, which means you can be sure that the senders
 * are who they say they are. Additionally, the structure of a JWT allows
 * you to verify that the content hasn't been tampered with
 */

//JWTs are used as a secure way to authenticate users and share information.
//Generate a token for this user and send back to the requester
function generateAuthToken(user) {
  const token = jtw.sign(
    { _id: user._id.toString() },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
}

function getPublicProfile(User) {
  //Get raw object with user data attached. So this going to remove all of
  //those stuff that mongoose has on there to perform things like save
  //operation. We want back an object with just our user data.
  //Converts this document into a plain-old JavaScript object (POJO)
  const userObject = User.toObject();
  //Now we change the object what we want to expose to the client
  //The delete keyword deletes a property from an object
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
}

async function dbFunction(requestData) {
  try {
    //Connect mongoose to mongoDB Database server (running on machine)
    //And create the database "task-manager-api"
    await mongoose.connect(process.env.MONGODB_DRIVER_URL);

    //Models are defined through the Schema interface.
    const UserSchema = createUserSchema(mongoose);

    //It’s a reference to the task data stored in the separate collection.
    UserSchema.virtual("task", {
      ref: "Task",
      localField: "_id",
      foreignField: "owner_id",
    });

    //Accessing a Model (Creating a model)
    const User =
      //Check if model User exists then use it, else create it
      mongoose.models.User || mongoose.model("User", UserSchema);

    const TaskSchema = createTaskSchema(mongoose);
    const Task =
      mongoose.models.Task || mongoose.model("Task", TaskSchema);

    if (requestData.requestInfo === "CREATE_USER") {
      //Create User Object and save to the database
      return await createUserObject(User, requestData);
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
    //Delete user profile with all of it's task
    if (requestData.requestInfo === "DELETE_USER") {
      await Task.deleteMany({ owner_id: requestData._id });
      return await User.findByIdAndDelete(requestData._id);
    }
    if (requestData.requestInfo === "LOGIN_USER") {
      return await findByCredentials(User, requestData.requestBody);
    }
    if (requestData.requestInfo === "USER_PROFILE") {
      //Mongoose automatically convert string _id to object ObjectId
      const user = await User.findById(requestData._id);
      return getPublicProfile(user);
    }
    if (requestData.requestInfo === "AUTH_USER") {
      //The other thing we want to check is this token still part of
      //the tokens array. When user logs out, we want to delete that
      //token. So we want to make sure it exist inside the database.
      //Need to setup another property but with string property name
      //because we will be using a special character inside of there
      //and it going to be 'tokens.token', the is going to look for a
      //user that has the given token value in one of their array items
      //in the tokens array. All this is going to do is find a user the
      //correct _id who has that authentication token still stored.
      const query = {
        _id: requestData._id,
        "tokens.token": requestData.token,
      };
      return await User.findOne(query);
    }
    if (requestData.requestInfo === "LOGOUT_USER") {
      return await requestData.user.save();
    }

    if (requestData.requestInfo === "UPLOAD_FILE") {
      return await requestData.user.save();
    }

    if (requestData.requestInfo === "DELETE_UPLOAD_PROFILE") {
      return await requestData.user.save();
    }
    if (requestData.requestInfo === "CREATE_TASK") {
      const { requestBody, userId } = requestData;
      return await createTaskObject(Task, requestBody, userId);
    }
    //Get all tasks created by that authenticated user.
    if (requestData.requestInfo === "GET_ALL_TASKS") {
      const { owner_id, completed, limit, skip, sortBy } = requestData;
      return await Task.find({ owner_id, completed })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: sortBy });
    }
    if (requestData.requestInfo === "GET_TASK") {
      //const task = await Task.findById(requestData._id);
      //task id - _id, user id - owner_id
      const { _id, owner_id } = requestData;
      //findOne allow us to use multiple fields to find the specific task
      return await Task.findOne({ _id, owner_id });
    }
    if (requestData.requestInfo === "UPDATE_TASK") {
      const { _id, owner_id } = requestData;
      return await Task.findOneAndUpdate(
        { _id, owner_id },
        requestData.body,
        { new: true, runValidators: true }
      );
    }
    if (requestData.requestInfo === "DELETE_TASK") {
      const { _id, owner_id } = requestData;
      return await Task.findOneAndDelete({ _id, owner_id });
    }
  } catch (error) {
    throw new Error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

module.exports = dbFunction;
