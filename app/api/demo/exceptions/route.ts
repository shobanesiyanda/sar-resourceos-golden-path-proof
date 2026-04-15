import exceptionsData from "../../../../data/exceptions.json";

export async function GET() {
  return Response.json(exceptionsData);
}
