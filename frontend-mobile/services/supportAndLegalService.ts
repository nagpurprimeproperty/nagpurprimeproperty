import { apiClient } from "@/api/apiClient";

// ─── Base response wrapper ────────────────────────────────────────────────────

export interface StaticPageResponse<T = string> {
  success: boolean;
  data: {
    _id: string;
    slug: string;
    title: string;
    content: T;
    metaTitle: string;
    metaDescription: string;
    isPublished: boolean;
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── About-Us content schema (JSON-encoded string in `content`) ────────────────

export interface AboutUsContent {
  type: "about";
  version: string;
  tagline: string;
  mission: string;
  whatWeOffer: string[];
  stats: {
    properties: string;
    brokers: string;
    users: string;
    cities: string;
  };
  contactInfo: {
    website: string;
    email: string;
    phone: string;
    address: string;
  };
}

// ─── Contact-Us content schema (JSON-encoded string in `content`) ─────────────

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ContactUsContent {
  type: "contact";
  phone: string;
  email: string;
  whatsapp: string;
  supportHours: string;
  faqs: FAQ[];
}

// ─── API fetch functions ──────────────────────────────────────────────────────

const BASE = "/static-pages";

/** Privacy Policy — `content` is an HTML string */
export const getPrivacyPolicy = async (): Promise<
  StaticPageResponse<string>
> => {
  const res = await apiClient.get<StaticPageResponse<string>>(
    `${BASE}/privacy-policy`,
  );
  return res.data;
};

/** Terms & Conditions — `content` is an HTML string */
export const getTermsAndConditions = async (): Promise<
  StaticPageResponse<string>
> => {
  const res = await apiClient.get<StaticPageResponse<string>>(
    `${BASE}/terms-and-conditions`,
  );
  return res.data;
};

/** About Us — `content` is a JSON-encoded string → parsed to `AboutUsContent` */
export const getAboutUs = async (): Promise<
  StaticPageResponse<AboutUsContent>
> => {
  const res = await apiClient.get<StaticPageResponse<string>>(
    `${BASE}/about-us`,
  );
  const raw = res.data;
  const parsed: AboutUsContent =
    typeof raw.data.content === "string"
      ? JSON.parse(raw.data.content)
      : raw.data.content;
  return { ...raw, data: { ...raw.data, content: parsed } };
};

/** Contact Us — `content` is a JSON-encoded string → parsed to `ContactUsContent` */
export const getContactUs = async (): Promise<
  StaticPageResponse<ContactUsContent>
> => {
  const res = await apiClient.get<StaticPageResponse<string>>(
    `${BASE}/contact-us`,
  );
  const raw = res.data;
  const parsed: ContactUsContent =
    typeof raw.data.content === "string"
      ? JSON.parse(raw.data.content)
      : raw.data.content;
  return { ...raw, data: { ...raw.data, content: parsed } };
};
