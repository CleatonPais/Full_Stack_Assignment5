import express from 'express'
import Controller from '../Controller/controller.js';
import { isDriver, isValid, isAdmin, isExaminer } from '../middlewears/validUser.js';

const router  = express.Router()

router.get('/',isValid, Controller.dashboard);
router.get('/dashboard',isValid,Controller.dashboard);

router.get('/registration', Controller.registration_get);
router.post('/registration', Controller.registration_post)

router.get('/login', Controller.login_get);
router.post('/login', Controller.login_post);

router.get('/G2',isDriver, Controller.g2_get);
router.post('/G2',isDriver, Controller.g2_post);

router.get('/G',isDriver, Controller.g_get);
router.post('/G',isDriver, Controller.g_post);

router.get('/appointments',isAdmin, Controller.appointments_get);
router.post('/appointments',isAdmin, Controller.appointments_post);

router.get('/getDate',isAdmin, Controller.show_appointments_date_get);
router.post('/booking',isDriver, Controller.g2_appointment_post);

router.post('/bookingG',isDriver, Controller.g_appointment_post);

router.get('/examiner',isExaminer, Controller.examiner_get);
router.post('/examiner',isExaminer, Controller.examiner_post);

router.get('/results', isAdmin, Controller.show_result_get);

router.get('/logout', Controller.logout);

export default router;