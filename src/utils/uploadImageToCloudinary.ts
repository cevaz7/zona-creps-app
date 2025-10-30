export async function uploadImageToCloudinary(file: File): Promise<string> {
  const CLOUD_NAME = "TU_CLOUD_NAME"; // 👈 reemplaza con tu cloud_name
  const UPLOAD_PRESET = "TU_UPLOAD_PRESET"; // 👈 reemplaza con tu upload_preset

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Imagenes_productos");

  const res = await fetch(`https://api.cloudinary.com/v1_1/doyzxqnlq/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data = await res.json();
  return data.secure_url; // ← URL final de la imagen
}
