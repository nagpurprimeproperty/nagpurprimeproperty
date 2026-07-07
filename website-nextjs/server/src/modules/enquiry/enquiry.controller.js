import enquiryService from './enquiry.service.js';

export const listEnquiries = async (req, res, next) => {
  try {
    console.log('User ID:', req.user?.id);
    const enquiries = await enquiryService.enquiryLeads(req.user?.id, req.query);
    res.json({ success: true,  ...enquiries });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiryId = req.params.id;
    const userId = req.user?.id;
    const enquiry = await enquiryService.getEnquiry(enquiryId, userId);
    res.json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};
