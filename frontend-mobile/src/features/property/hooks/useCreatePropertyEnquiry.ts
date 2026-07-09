import { useApiMutation } from "@/hooks/useApiQuery";
import { propertyKeys, enquiryKeys } from "@/features/property/keys/propertyKeys";

export const useCreatePropertyEnquiry = (id?: string) => {
  return useApiMutation(
    `/properties/${id}/create-enquiry`,
    "post",
    [propertyKeys.detail(id), enquiryKeys.all],
  );
};
