import {NextResponse} from "next/server";
import {getDealScopeAssessmentServices} from "../../../lib/server/assessment-runtime.mjs";
import {executeAssessmentRequest} from "../../../lib/server/assessment-service.mjs";
export const dynamic="force-dynamic";
/** Fail closed until dedicated SAR-owned DealScope Auth/RLS, data storage,
 * current legal acceptance, evidence adapters and explicit release. */
function unavailable(){
 return NextResponse.json({service:"dealscope",operation:"deal_assessments",status:"not_activated",
  message:"Authenticated customer assessments are not yet available. Dedicated identity, private storage and operational acceptance are required."},
  {status:503,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
export async function GET(){return unavailable()}
export async function POST(request:Request){
 const services=getDealScopeAssessmentServices();
 if(!services)return unavailable();
 const outcome=await executeAssessmentRequest({request,services});
 return NextResponse.json(outcome.body,{status:outcome.status,
  headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}