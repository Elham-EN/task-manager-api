//Defining a Task model

const createTaskSchema = (mongoose) => {
  return mongoose.Schema({
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  });
};

module.exports = createTaskSchema;
