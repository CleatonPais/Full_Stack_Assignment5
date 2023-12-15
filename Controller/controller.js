import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";

class Controller {
  isLoggedIn = req.session.isLoggedIn || "";
  userType = req.session.userType || "";

  static dashboard = (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;
    const userData =  req.session.userData;
    res.render("dashboard", { isLoggedIn, userType, userData });
  };

  static registration_get = (req, res) => {
    const sign_up_message = req.session.signup_msg;
    delete req.session.signup_msg;
    // delete req.session.isLoggedIn;
    // delete req.session.userType;

    const username_exists_message = req.session.username_exists_message || "";
    delete req.session.username_exists_message;

    const isLoggedIn = false;
    const userType = "";

    res.render("registration", {
      sign_up_message,
      isLoggedIn,
      userType,
      username_exists_message,
    });
  };

  static registration_post = async (req, res) => {
    try {
      const signup_form_data = req.body;

      console.log(signup_form_data);

      const find_existing_username = await userModel.findOne({
        username: signup_form_data.username,
      });

      if (!find_existing_username) {
        if (signup_form_data.password === signup_form_data.confirm_password) {
          const hashed_password = await bcrypt.hash(
            signup_form_data.password,
            12
          );
          const userData = new userModel({
            firstName: "nil",
            lastName: "nil",
            licenseNo: 0,
            age: 0,
            username: signup_form_data.username,
            password: hashed_password,
            userType: signup_form_data.user_type,

            carDetails: {
              make: "nil",
              model: "nil",
              year: 0,
              plateNo: "nil",
            },
          });

          const save_userData = await userData.save();
          res.redirect("/login");
        } else {
          res.redirect("/registration");
        }
      } else {
        req.session.username_exists_message = "Username already exists";
        res.redirect("/registration");
      }
    } catch (err) {
      console.log(`userData error: ${err}`);
    }
    res.render("registration");
  };

  static login_get = (req, res) => {
    const incorrect_password_message = req.session.pwd_msg;
    delete req.session.pwd_msg;

    req.session.isLoggedIn = false;
    req.session.userType = "";

    const login_prompt = req.session.error;

    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;

    res.render("login", {
      incorrect_password_message,
      isLoggedIn,
      userType,
      login_prompt,
    });
  };

  static login_post = async (req, res) => {
    try {
      const login_form_data = req.body;

      const user_matched = await userModel.findOne({
        username: login_form_data.username,
      });

      // console.log(user_matched)

      if (user_matched) {
        const pwd_matched = await bcrypt.compare(
          login_form_data.password,
          user_matched.password
        );

        if (pwd_matched) {
          // set session data for logged in user
          req.session.username = login_form_data.username;
          req.session.password = user_matched.password;
          req.session.isLoggedIn = true;
          req.session.userType = user_matched.userType;
          req.session.userData = user_matched;

          res.redirect("/dashboard");
        } else {
          req.session.pwd_msg = "Please enter correct password";
          req.session.isLoggedIn = false;
          req.session.userType = user_matched.userType || "";

          res.redirect("/login");
        }
      } else {
        req.session.signup_msg = "Please Sign Up First";

        // Use these session variables in signup_get
        res.redirect("/registration");
      }
    } catch (err) {
      console.log(`You have an error: ${err} `);
    }
  };

  static g2_get = async (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;
    const user_matched = await userModel.findOne({
      username: req.session.username,
    });

    const userHasAppointment = await Appointment.findOne({
      user: req.session.userData._id,
    });

    console.log('User has appointment')
    console.log(userHasAppointment);
     // Create an array to store date-time slot pairs
     const dateAndTimeSlots = [];

    if (!userHasAppointment){
      const uniqueDates = await Appointment.distinct("date");

    
  
      // Iterate over each unique date and fetch the available time slots
      for (const date of uniqueDates) {
        const availableTimeSlots = await getAvailableTimeSlotsForDate(date);
  
        if(availableTimeSlots.length > 0)
        // Add the date and corresponding time slots to the array
          dateAndTimeSlots.push({ date, availableTimeSlots });
      }

      console.log(dateAndTimeSlots);
  
      async function getAvailableTimeSlotsForDate(date) {
        const currentDate = new Date();
        const appointmentDate = new Date(date);

        // Check if the appointment date is after today
        if (appointmentDate > currentDate) {
          const existingAppointments = await Appointment.find({
            date,
            isTimeSlotAvailable: true,
            testType: 'G2',
          });

           console.log(existingAppointments);
          const bookedTimeSlots = existingAppointments.map(
            (appointment) => appointment.time
          );

          
  
          // Modify this based on your logic to get available time slots
          const allTimeSlots = [
            "9:00",
            "9:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
          ];
  
          // Filter out booked time slots
          const availableTimeSlots = allTimeSlots.filter((slot) =>
            bookedTimeSlots.includes(slot)
          );
  
          return availableTimeSlots;
        }
        return [];
      }
    }

    res.render("G2", { isLoggedIn, userType, user_matched, dateAndTimeSlots, userHasAppointment });
  };

  static g2_post = async (req, res) => {
    try {
      const form_data = req.body;

      console.log("Form data");
      console.log(form_data);

      const hashed_licenseNo = await bcrypt.hash(form_data.g2_licenseNo, 12);

      const userData = {
        firstName: form_data.g2_firstName,
        lastName: form_data.g2_lastName,
        licenseNo: hashed_licenseNo,
        age: form_data.age,
        username: req.session.username,
        password: req.session.password,
        userType: req.session.userType,

        carDetails: {
          make: form_data.car_make,
          model: form_data.car_model,
          year: form_data.car_year,
          plateNo: form_data.car_plateNo,
        },
      };

      const id = req.session.userData._id;
      console.log(id);

      console.log(userData);

      const save_userData = await userModel.findByIdAndUpdate(id, userData);

      // const save_userData = await userModel.findByIdAndUpdate(id, {
      //   firstName: form_data.g2_firstName,
      //   lastName: form_data.g2_lastName,
      //   licenseNo: hashed_licenseNo,
      //   age: form_data.age,
      //   username: req.session.username,
      //   password: req.session.password,
      //   userType: req.session.userType,

      //   carDetails: {
      //     make: form_data.car_make,
      //     model: form_data.car_model,
      //     year: form_data.car_year,
      //     plateNo: form_data.car_plateNo,
      //   },
      // });

      console.log(save_userData);
      req.session.userData = save_userData;

      res.redirect("/G2");
    } catch (err) {
      console.log(`userData error: ${err}`);
    }
  };

  static g2_appointment_post = async (req, res) => {
    const { date, time } = req.body;
    try {
      // Check if the time slot is available for booking
      const existingAppointment = await Appointment.findOne({
        date,
        time,
        isTimeSlotAvailable: true,
        testType: 'G2',
      });

      console.log(existingAppointment);
      existingAppointment.time = time;
      // Update the appointment record to mark the time slot as booked
      existingAppointment.isTimeSlotAvailable = false;
      existingAppointment.testType = 'G2';

      // Link the appointment to the logged-in user
      existingAppointment.user = req.session.userData._id; // Assuming the user is stored in req.user

      // Save the updated appointment
      await Appointment.findByIdAndUpdate(
        existingAppointment._id,
        existingAppointment
      );

      // Associate the appointment with the user
      req.session.userData.appointments.push(existingAppointment);
      await userModel.findByIdAndUpdate(req.session.userData._id, {
        testType: "G2",
        appointments: existingAppointment,
      });

      res.redirect('/G2');
    } catch (err) {
      console.log(`g2 appointments error: ${err}`);
    }
  };

  static g_get = async (req, res) => {
    try {
      const form_data = req.query.licenseNo;

      //console.log("Form data");
      // console.log(form_data);

      const user_matched = await userModel.findOne({
        username: req.session.username,
      });
      //console.log(user_matched);

      const userHasAppointment = await Appointment.findOne({
        user: req.session.userData._id,
      });
      console.log("User has appointment");
      console.log(userHasAppointment);
      // Create an array to store date-time slot pairs
      const dateAndTimeSlots = [];

      if (!userHasAppointment) {
        const uniqueDates = await Appointment.distinct("date");
  
        // Iterate over each unique date and fetch the available time slots
        for (const date of uniqueDates) {
          const availableTimeSlots = await getAvailableTimeSlotsForDate(date);
  
          if (availableTimeSlots.length > 0)
            // Add the date and corresponding time slots to the array
            dateAndTimeSlots.push({ date, availableTimeSlots });
        }
  
        console.log(dateAndTimeSlots);
  
        async function getAvailableTimeSlotsForDate(date) {
          const currentDate = new Date();
          const appointmentDate = new Date(date);
  
          // Check if the appointment date is after today
          if (appointmentDate > currentDate) {
            const existingAppointments = await Appointment.find({
              date,
              isTimeSlotAvailable: true,
              testType: 'G',
            });
            const bookedTimeSlots = existingAppointments.map(
              (appointment) => appointment.time
            );
  
            // Modify this based on your logic to get available time slots
            const allTimeSlots = [
              "9:00",
              "9:30",
              "10:00",
              "10:30",
              "11:00",
              "11:30",
              "12:00",
              "12:30",
              "1:00",
              "1:30",
              "2:00",
            ];
  
            // Filter out booked time slots
            const availableTimeSlots = allTimeSlots.filter((slot) =>
              bookedTimeSlots.includes(slot)
            );
  
            return availableTimeSlots;
          }
          return [];
        }
      }

      const isLoggedIn = req.session.isLoggedIn;
      const userType = req.session.userType;

      res.render("G", { user_matched, form_data, isLoggedIn, userType, dateAndTimeSlots, userHasAppointment});
    } catch (err) {
      console.log(`userData error: ${err}`);
    }
  };

  static g_post = async (req, res) => {
    try {
      const form_data = req.body;

      console.log("Form data");
      console.log(form_data);

      const updated_data = {
        make: form_data.car_make,
        model: form_data.car_model,
        year: form_data.car_year,
        plateNo: form_data.car_plateNo,
      };

      const save_updated_data = await userModel.findByIdAndUpdate(
        form_data.id,
        {
          carDetails: updated_data,
        }
      );

      console.log(save_updated_data);
      req.session.userData = save_updated_data;

      // const updated_route = "/G?" + "licenseNo=" + form_data.licenseNo;

      res.redirect("/G");
    } catch (err) {
      console.log(`userData error: ${err}`);
    }
  };

  static g_appointment_post = async (req, res) => {
    const { date, time } = req.body;
    try {
      // Check if the time slot is available for booking
      const existingAppointment = await Appointment.findOne({
        date,
        time,
        isTimeSlotAvailable: true,
        testType: 'G',
      });

      console.log(existingAppointment);
      existingAppointment.time = time;
      // Update the appointment record to mark the time slot as booked
      existingAppointment.isTimeSlotAvailable = false;

      existingAppointment.testType = 'G';
      // Link the appointment to the logged-in user
      existingAppointment.user = req.session.userData._id; // Assuming the user is stored in req.user

      // Save the updated appointment
      await Appointment.findByIdAndUpdate(
        existingAppointment._id,
        existingAppointment
      );

      // Associate the appointment with the user
      req.session.userData.appointments.push(existingAppointment);
      await userModel.findByIdAndUpdate(req.session.userData._id, {
        testType: "G",
        appointments: existingAppointment,
      });

      res.redirect("/G");
    } catch (err) {
      console.log(`g appointments error: ${err}`);
    }
  };

  static show_appointments_date_get = async (req,res) =>{
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;
    const selectedDate = false;
    const testType = false;
    res.render("appointments", {
      isLoggedIn,
      userType,
      selectedDate,
      testType
    });
  };

  static appointments_get = async (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;

    const availableTimeSlots = [
      "9:00",
      "9:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
    ];

     // Get the selected date from the request body or query parameters
     const selectedDate = req.body.date || req.query.date;
     const testType = req.query.testType;

     console.log(testType)
     req.session.selectedDate = selectedDate;
     req.session.testType = testType;

     // If no date is selected, default to the current date
     const currentDate = selectedDate || new Date().toISOString().split("T")[0];

    const existingAppointments = await Appointment.find({date: currentDate, testType: testType});

    console.log(existingAppointments);

    // Create an array of already booked time slots
    const bookedTimeSlots = existingAppointments.map(
      (appointment) => appointment.time
    );

    res.render("appointments", {
      isLoggedIn,
      userType,
      availableTimeSlots,
      bookedTimeSlots,
      selectedDate,
      testType
    });
  };

  static appointments_post = async (req, res) => {
    try {
      const { time } = req.body;

      const date = req.session.selectedDate;
      delete req.session.selectedDate;

      const testType =  req.session.testType;
      delete req.session.testType;

      const existingAppointment = await Appointment.findOne({ date, time, testType });

      const newAppointment = new Appointment({
        date,
        time,
        isTimeSlotAvailable: true,
        testType: testType,
      });

      // Save the appointment to the database
      const save_Appointment = await newAppointment.save();

      console.log("saved");
      res.redirect('/appointments')
    } catch (err) {
      console.log(`appointments error: ${err}`);
    }
  };

  static examiner_get = async (req, res) => {
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;

    const appointmentList = await userModel.find({ testType: { $in: ['G', 'G2'] } }).populate('appointments');
    console.log(appointmentList);

    res.render("examiner", {
      isLoggedIn,
      userType,
      appointmentList,
    });
  };

  static examiner_post = async (req,res) => {
    const { userID, comments, testResult, appointmentID } = req.body;

    console.log(testResult);

    await userModel.findByIdAndUpdate(userID, {
      testResult: testResult,
      comments: comments,
    });

    await userModel.findByIdAndUpdate(
      userID,
      { $pull: { appointments: appointmentID } },
      { new: true }
    );

    res.redirect("/examiner");
  }

  static show_result_get =  async (req,res) => {
    const resultList = await userModel.find({ testResult: { $in: ['pass', 'fail'] } });
    console.log(resultList);
    const isLoggedIn = req.session.isLoggedIn;
    const userType = req.session.userType;

    res.render("results", {isLoggedIn, userType, resultList});
  }

  static logout = async (req, res) => {
    req.session.destroy();

    res.redirect("/login");
  };
}

export default Controller;
