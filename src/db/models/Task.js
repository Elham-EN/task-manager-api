//Defining a Task model

//Individual task store the id of the user who created the task
const createTaskSchema = (mongoose) => {
  return mongoose.Schema(
    {
      description: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      owner_id: {
        //An ObjectId is a special type typically used for unique identifiers.
        //Mongoose schema as the configuration object for a Mongoose model.
        //A SchemaType is then a configuration object for an individual property.
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //The ref option is what tells Mongoose which model to
        ///use during population, in our case the User model.
        ref: "User", //reference to user model (to create that relationship)
      },
    },
    { timestamps: true }
  );
};

module.exports = createTaskSchema;
