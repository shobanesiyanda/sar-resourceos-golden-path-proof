import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
/** Fail closed until dedicated SAR-owned DealScope Auth/RLS, counsel-approved
 * current legal versions, trusted assessment delivery and explicit release. */
function unavailable(){
 return NextResponse.json({service:"dealscope",operation:"customer_orders",status:"not_activated",
  message:"This customer service is not yet available. The legal, identity, data security and operational release requirements remain under review."},
  {status:503,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
export async function GET(){return unavailable()}
export async function POST(){return unavailable()}
