import savedPropertyService from "./savedProperty.service.js";
 
 export const savePropertyToggle = async (req, res) => {
    try {
    const userId = req.user?._id || req.user?.id;
    const propertyId = req.params?.id;
      const result = await savedPropertyService.savePropertyToggle(userId, propertyId);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
 