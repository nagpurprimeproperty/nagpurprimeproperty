import leadService from './lead.service.js';
import mongoose from 'mongoose';
import propertyService from '../property/property.service.js';
import userService from '../user/user.service.js';

export const listLeads = async (req, res, next) => {
  try {
    const brokerId = req.user?.id;
    const { page, limit } = req.query;
    const leads = await leadService.listLeads(brokerId, { page, limit });
    res.json({ success: true, data: leads });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const brokerId = req.user?.id;
    const lead = await leadService.getLead(leadId, brokerId);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const userId = req.user?.id;
    const propertyId = req.params.id;
    const userIp = req?.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const property = await propertyService.getProperty(propertyId, userId, userIp, session);

    const brokerId = property.brokerId?._id || property.brokerId;
    const brokerDetails = await userService.getUser(brokerId).catch(() => null);

    if (existingLead) {
      await session.abortTransaction();
      return res.json({
        success: true,
        message: 'Lead already exists for this property and user',
        data: { ...(existingLead._doc || existingLead), brokerDetails }
      });
    }

    const lead = await leadService.createLead({ ...req.body, userId, propertyId, brokerId }, session);

    await session.commitTransaction();
    res.json({ success: true, data: { ...(lead._doc || lead), brokerDetails } });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

export const createLeadByOnlyFetchDataFromPropertyId = async (req, res, next) => {
   let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const userId = req.user?.id;
    const propertyId = req.params.id;
    const userIp = req?.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    const property = await propertyService.getProperty(propertyId, userId, userIp, session);
    if (!property) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const realPropertyId = property._id;
    const existingLead = await leadService.getLeadByPropertyAndUser(realPropertyId, userId);
    if (existingLead) {
      await session.abortTransaction();
      const brokerId = property.brokerId?._id || property.brokerId;
      const brokerDetails = await userService.getUser(brokerId).catch(() => null);
      return res.json({
        success: true,
        message: 'Lead already exists for this property and user',
        data: { ...(existingLead._doc || existingLead), brokerDetails }
      });
    }

    const brokerId = property.brokerId?._id || property.brokerId;
    const lead = await leadService.createLeadByOnlyFetchDataFromPropertyId(realPropertyId, req.user, session);
    const brokerDetails = await userService.getUser(brokerId).catch(() => null);
    await session.commitTransaction();
    res.json({ success: true, data: { ...(lead._doc || lead), brokerDetails } });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};
export const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const userId = req.user?.id;
    const status = req.body?.status;
    await leadService.updateStatus(leadId, status, userId);
    res.json({ success: true,  message: 'Lead status updated successfully', });
  } catch (error) {
    next(error);
  }
};