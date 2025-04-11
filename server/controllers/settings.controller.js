import Settings from '../models/settings.model.js';
import { handleAsync } from '../utils/errorHandler.js';
import { AppError } from '../utils/appError.js';

// Get all settings
export const getSettings = handleAsync(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

// Update general settings
export const updateGeneralSettings = handleAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: { general: req.body } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

// Update payment settings
export const updatePaymentSettings = handleAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: { payment: req.body } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

// Update shipping settings
export const updateShippingSettings = handleAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: { shipping: req.body } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

// Update email settings
export const updateEmailSettings = handleAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: { email: req.body } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: settings
  });
}); 