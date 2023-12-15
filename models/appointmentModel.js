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

const appointmentSchema = new mongoose.Schema({
  date: { type: Date },
  time: { type: String },
  isTimeSlotAvailable: { type: Boolean },
  testType: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "car_owner_record",
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
