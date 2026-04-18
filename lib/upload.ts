/**
 * Utility function to upload an image to Cloudinary via our API route.
 */
export interface UploadResponse {
  imageUrl: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  // 1. Validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB.");
  }

  // 2. Upload
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload image.");
  }

  return response.json();
};
