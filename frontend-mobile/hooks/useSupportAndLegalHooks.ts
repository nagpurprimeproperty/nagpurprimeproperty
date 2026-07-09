import { useQuery } from "@tanstack/react-query";
import {
  getAboutUs,
  getContactUs,
  getPrivacyPolicy,
  getTermsAndConditions,
  type AboutUsContent,
  type ContactUsContent,
  type StaticPageResponse,
} from "@/services/supportAndLegalService";
import { staticPageKeys } from "@/api/keys/staticPageKeys";

// ─── Stale time: 1 hour — static pages don't change often ────────────────────
const STALE_TIME = 60 * 60 * 1000;

// ─── Privacy Policy ───────────────────────────────────────────────────────────

export const usePrivacyPolicy = () =>
  useQuery<StaticPageResponse<string>, Error>({
    queryKey: staticPageKeys.privacyPolicy(),
    queryFn: getPrivacyPolicy,
    staleTime: STALE_TIME,
  });

// ─── Terms & Conditions ───────────────────────────────────────────────────────

export const useTermsAndConditions = () =>
  useQuery<StaticPageResponse<string>, Error>({
    queryKey: staticPageKeys.termsAndConditions(),
    queryFn: getTermsAndConditions,
    staleTime: STALE_TIME,
  });

// ─── About Us ─────────────────────────────────────────────────────────────────

export const useAboutUs = () =>
  useQuery<StaticPageResponse<AboutUsContent>, Error>({
    queryKey: staticPageKeys.aboutUs(),
    queryFn: getAboutUs,
    staleTime: STALE_TIME,
  });

// ─── Contact Us ───────────────────────────────────────────────────────────────

export const useContactUs = () =>
  useQuery<StaticPageResponse<ContactUsContent>, Error>({
    queryKey: staticPageKeys.contactUs(),
    queryFn: getContactUs,
    staleTime: STALE_TIME,
  });
