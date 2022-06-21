const stringValidator = require("validator").default;

//Defining a User model

const createUserSchema = (mongoose) => {
  return mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      //Custom Validator
      validate: function (value) {
        if (!stringValidator.isAlpha(value)) {
          throw new Error(`${value} is not a string`);
        }
      },
    },
    age: {
      type: Number,
      required: true,
      validate: function (value) {
        if (value < 0) {
          throw new Error("Age must be positive number");
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true, //Prevent new user using an existing email
      trim: true,
      lowercase: true,
      validate: function (value) {
        if (!stringValidator.isEmail(value)) {
          throw new Error(`${value} is not a valid email`);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      trim: true,
      validate: function (value) {
        if (value.toLowerCase() === "password")
          throw new Error(`Password must not contain the word "password"`);
      },
    },
  });
};

module.exports = createUserSchema;
