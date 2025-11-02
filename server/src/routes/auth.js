import express from 'express';
import { lineCallback, lineSdkCallback } from '../controllers/authController.js';

const router = express.Router();

// LINE Login コールバック
router.post('/line/callback', lineCallback);

// LINE SDK コールバック
router.post('/line/sdk-callback', lineSdkCallback);

export default router;
