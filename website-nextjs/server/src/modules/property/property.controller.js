import propertyService from "./property.service.js";

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
    const userIp = req?.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const property = await propertyService.getProperty(propertyId, userId, userIp);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};