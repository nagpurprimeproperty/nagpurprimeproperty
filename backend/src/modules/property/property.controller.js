import propertyService from "./property.service.js";
import { validatePropertyPayload } from "./property.schema.js";


export const getPopularLocalitiesCount = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Default to top 5 if not specified
    const data = await propertyService.getMostPopularAreasCount(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


export const getListedProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.listProperties(req.query, req.user?.id);
    res.json({
      success: true,
      data: properties.data,
      total: properties.total,
      page: properties.page,
      limit: properties.limit,
      totalPages: properties.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProperties = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const properties = await propertyService.getSimilarProperties(propertyId, req.user?.id);
    res.json({
      success: true,
      data: properties.data,
      total: properties.total,
      page: properties.page,
      limit: properties.limit,
      totalPages: properties.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.id;
    const userIp= req?.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const property = await propertyService.getProperty(propertyId, userId,userIp);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const getMyProperties = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const result = await propertyService.listMyProperties(userId, req.query);
    res.json({ success: true, data: result.data, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages });
  } catch (error) {
    next(error);
  }
};

export const getMyProperty = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const prop = await propertyService.getMyPropertyById(userId, id);
    res.json({ success: true, data: prop });
  } catch (error) {
    next(error);
  }
};

export const createMyProperty = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    console.log("Creating property for user:", userId);
    const payload = req.body;
    
    // Validate full payload including details and pricing based on property type
    const validationResult = validatePropertyPayload(payload);
    if (validationResult.errors) {
      return next({
        statusCode: 400,
        message: "Validation Error",
        errors: validationResult.errors,
      });
    }
    
    // Use the fully validated data (includes validated details and pricing)
    const validatedPayload = validationResult.data;
    
    const created = await propertyService.createMyProperty(userId, validatedPayload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const updateMyProperty = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const payload = req.body;
    const updated = await propertyService.updateMyProperty(userId, id, payload);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMyProperty = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    await propertyService.deleteMyProperty(userId, id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const toggleFeaturedMyProperty = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const updated = await propertyService.toggleFeaturedMyProperty(userId, id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateMyPropertyStatus = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const id = req.params.id;
    const { status } = req.body;
    const updated = await propertyService.updateMyPropertyStatus(userId, id, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};