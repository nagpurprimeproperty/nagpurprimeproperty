import { apiClient } from "@/api/apiClient";
import { useAuthStore, type AuthUser } from "@/features/auth";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type ProfileUpdatePayload = Partial<AuthUser> & {
  avatarUri?: string;
};

const isProfileUser = (value: unknown): value is AuthUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string" ||
    typeof candidate.mobile === "string" ||
    typeof candidate.email === "string" ||
    typeof candidate._id === "string"
  );
};

const normalizeProfileUser = (payload: unknown): AuthUser | null => {
  if (isProfileUser(payload)) {
    return payload as AuthUser;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;

  const nestedCandidate =
    candidate.data && typeof candidate.data === "object"
      ? candidate.data
      : candidate.profile && typeof candidate.profile === "object"
        ? candidate.profile
        : candidate.user && typeof candidate.user === "object"
          ? candidate.user
          : null;

  if (nestedCandidate) {
    return normalizeProfileUser(nestedCandidate);
  }

  return null;
};

const getAvatarMimeType = (avatarUri: string) => {
  const lowerUri = avatarUri.toLowerCase();

  if (lowerUri.includes(".png")) {
    return "image/png";
  }

  if (lowerUri.includes(".webp")) {
    return "image/webp";
  }

  if (lowerUri.includes(".gif")) {
    return "image/gif";
  }

  return "image/jpeg";
};

const getAvatarFileName = (avatarUri: string) => {
  const lowerUri = avatarUri.toLowerCase();

  if (lowerUri.includes(".png")) {
    return `avatar-${Date.now()}.png`;
  }

  if (lowerUri.includes(".webp")) {
    return `avatar-${Date.now()}.webp`;
  }

  if (lowerUri.includes(".gif")) {
    return `avatar-${Date.now()}.gif`;
  }

  return `avatar-${Date.now()}.jpg`;
};

const isRemoteAvatarUri = (avatarUri?: string) => Boolean(avatarUri && avatarUri.startsWith("http"));

const isLocalAvatarUri = (avatarUri?: string) => Boolean(avatarUri && avatarUri.startsWith("file://"));

const getProfileTextFields = (data: ProfileUpdatePayload) =>
  Object.fromEntries(
    Object.entries({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      city: data.city,
      area: data.area,
    }).filter(([, value]) => value !== undefined && value !== null),
  ) as Record<string, string>;

const getCurrentUserSnapshot = () => useAuthStore.getState().user;

const buildFallbackUpdatedProfile = (data: ProfileUpdatePayload) => {
  const currentUser = getCurrentUserSnapshot();

  if (!currentUser) {
    return null;
  }

  // Always clone to a plain object to avoid 'getter only' assignment errors
  const nextUser = JSON.parse(JSON.stringify({
    ...currentUser,
    ...Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null),
    ),
  })) as AuthUser;

  if (data.avatarUri && !isLocalAvatarUri(data.avatarUri)) {
    nextUser.avatar = data.avatarUri;
  }

  return nextUser;
};

export const getProfile = async () => {
  const response = await apiClient.get<unknown>("/profile");
  return normalizeProfileUser(response.data);
};


const buildProfileFormData = async (data: ProfileUpdatePayload) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(getProfileTextFields(data))) {
    formData.append(key, value);
  }

  if (!data.avatarUri || isRemoteAvatarUri(data.avatarUri)) {
    return formData;
  }

  if (typeof window !== "undefined") {
    // Web: fetch the blob and append as File
    const res = await fetch(data.avatarUri);
    const blob = await res.blob();
    const file = new File(
      [blob],
      getAvatarFileName(data.avatarUri),
      { type: getAvatarMimeType(data.avatarUri) }
    );
    formData.append("avatar", file);
    return formData;
  }

  // Native local files are handled by FileSystem.uploadAsync, not FormData.
  return formData;
};

const getProfileUpdateUrl = () => {
  const baseURL = apiClient.defaults.baseURL?.replace(/\/$/, "");

  return `${baseURL ?? "https://nagpur-prime-property.onrender.com/api/v1"}/profile`;
};

const parseJsonResponseBody = (body: string | null) => {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const submitProfileFormData = async (
  requestUrl: string,
  token: string | null,
  data: ProfileUpdatePayload,
  formData: FormData,
) => {
  const response = await fetch(requestUrl, {
    method: "PUT",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body: formData,
  });

  if (response.status === 401) {
    await useAuthStore.getState().logout();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorPayload = await response.json();
      errorMessage =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.details ||
        errorMessage;
    } catch {
      // ignore JSON parsing failures
    }

    throw new Error(errorMessage);
  }

  const responseText = await response.text();
  const responseData = parseJsonResponseBody(responseText);
  const normalizedUser = normalizeProfileUser(responseData);

  return normalizedUser ?? buildFallbackUpdatedProfile(data);
};

const submitProfileJsonUpdate = async (data: ProfileUpdatePayload) => {
  const response = await apiClient.put<unknown>("/profile", getProfileTextFields(data));
  const normalizedUser = normalizeProfileUser(response.data);

  return normalizedUser ?? buildFallbackUpdatedProfile(data);
};

export const updateProfile = async (data: ProfileUpdatePayload) => {
  const token = useAuthStore.getState().token;
  const requestUrl = getProfileUpdateUrl();
  const isNative = Platform.OS !== "web";
  const avatarUri = data.avatarUri ?? undefined;

  if (isNative && isLocalAvatarUri(avatarUri)) {
    const localAvatarUri = avatarUri as string;
    const uploadResult = await FileSystem.uploadAsync(requestUrl, localAvatarUri, {
      httpMethod: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "avatar",
      mimeType: getAvatarMimeType(localAvatarUri),
      parameters: getProfileTextFields(data),
    });

    if (uploadResult.status === 401) {
      await useAuthStore.getState().logout();
    }

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      const errorPayload = parseJsonResponseBody(uploadResult.body);
      const errorMessage =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.details ||
        `Request failed with status ${uploadResult.status}`;

      throw new Error(errorMessage);
    }

    const responseData = parseJsonResponseBody(uploadResult.body);
    const normalizedUser = normalizeProfileUser(responseData);

    return normalizedUser ?? buildFallbackUpdatedProfile(data);
  }

  if (!avatarUri || isRemoteAvatarUri(avatarUri)) {
    return submitProfileJsonUpdate(data);
  }

  const formData = await buildProfileFormData(data);
  return submitProfileFormData(requestUrl, token, data, formData);
};