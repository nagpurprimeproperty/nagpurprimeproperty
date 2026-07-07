import mongoose from "mongoose";
import savedPropertyModel from "./savedProperty.model.js";

const savedPropertyRepository = {
  create: (payload) => {
    const userId = mongoose.Types.ObjectId.isValid(payload.userId) ? new mongoose.Types.ObjectId(payload.userId) : payload.userId;
    const propertyId = mongoose.Types.ObjectId.isValid(payload.propertyId) ? new mongoose.Types.ObjectId(payload.propertyId) : payload.propertyId;
    return savedPropertyModel.create({ userId, propertyId });
  },
  delete: (id) => {
    const docId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
    return savedPropertyModel.findByIdAndDelete(docId);
  },
  findById: (id) => {
    const docId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
    return savedPropertyModel.findById(docId).lean().exec();
  },
  findByUserId: (userId) => {
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    return savedPropertyModel.find({ userId: uId }).lean().exec();
  },
  findByPropertyId: (propertyId) => {
    const pId = mongoose.Types.ObjectId.isValid(propertyId) ? new mongoose.Types.ObjectId(propertyId) : propertyId;
    return savedPropertyModel.find({ propertyId: pId }).lean().exec();
  },
  findByUserIdAndPropertyId: (userId, propertyId) => {
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const pId = mongoose.Types.ObjectId.isValid(propertyId) ? new mongoose.Types.ObjectId(propertyId) : propertyId;
    return savedPropertyModel.findOne({ userId: uId, propertyId: pId }).lean().exec();
  },
};

export default savedPropertyRepository;