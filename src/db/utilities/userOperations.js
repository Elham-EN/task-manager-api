async function userModelOperation(mongoose, requestData) {
  //Models are defined through the Schema interface.
  const UserSchema = createUserSchema(mongoose);
  //Accessing a Model (Creating a model)
  const User =
    //Check if model User exists then use it, else create it
    mongoose.models.User || mongoose.model("User", UserSchema);
  if (requestData.requestInfo === "CREATE_USER")
    return await createUserDocument(User);
  if (requestData === "GET_ALL_USERS")
    return await getAllUserDocuments(User);
  if (requestData.requestInfo === "GET_USER")
    return await getUserDocumentById(User, requestData);
  if (requestData.requestInfo === "UPDATE_USER")
    return await updateUserDocumentById(User, requestData);
  if (requestData.requestInfo === "DELETE_USER")
    return await deleteUserDocumentById(User, requestData);
}

async function createUserDocument(User) {
  try {
    //Create User Object and save to the database
    return await createUserObject(User, requestData);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getAllUserDocuments(User) {
  const query = {};
  try {
    return await User.find(query);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getUserDocumentById(User, requestData) {
  try {
    //Mongoose automatically convert string _id to object ObjectId
    return await User.findById(requestData._id);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function updateUserDocumentById(User, requestData) {
  try {
    return await User.findByIdAndUpdate(
      requestData._id,
      requestData.body, //{name: "Hinata"}
      //Return the modified document rather than the original
      //Run validation for the update document. (validate the update
      //operation against the model's schema)
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteUserDocumentById(User, requestData) {
  try {
    return await User.findByIdAndDelete(requestData._id);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = userModelOperation;
