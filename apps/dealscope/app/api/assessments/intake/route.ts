import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
/** Upload/paste/manual intake requires active SAR-owned tenant identity, content
 * scanning, consent, secure storage, source hashes and confirmable extraction.
 * Never accept customer files into an unauthorised public preview. */
function unavailable(){
 return NextResponse.json({service:"dealscope",operation:"deal_source_intake",status:"not_activated",
  message:"Secure customer document and text intake is not yet activated."},
  {status:503,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
export async function GET(){return unavailable()}
export async function POST(){return unavailable()}
