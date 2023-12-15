import mongoose from "mongoose";
import {} from "dotenv/config";

// export const uri =
//   "mongodb+srv://krithidk:LearnMongo25@cluster0.rm3jlct.mongodb.net/drivetestGroup?retryWrites=true&w=majority";
export const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log("================== Connected to MongoDb ============== ")
  )
  .catch((err) =>
    console.log(`Connection failed due to this error below !\n ${err}`)
  );

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  licenseNo: { type: String, required: true },
  age: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  testType: { type: String },
  comments: { type: String },
  testResult: { type: String },

  carDetails: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    plateNo: { type: String, required: true },
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
});

const userModel = mongoose.model("car_owner_record", userSchema);

export default userModel;
