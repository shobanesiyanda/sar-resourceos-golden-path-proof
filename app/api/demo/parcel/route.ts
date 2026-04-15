import parcelData from "@/data/golden_path_parcel.json";

export async function GET() {
  return Response.json(parcelData);
}
