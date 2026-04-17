export async function generateFurnitureImage(params: any) {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.image;
}

export async function generateBOM(params: any) {
  const response = await fetch("/api/generate-bom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}
