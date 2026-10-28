import {NextResponse} from "next/server";
import {getDealScopeAssessmentServices} from "../../../../lib/server/assessment-runtime.mjs";
import {executeConfirmationRequest} from "../../../../lib/server/assessment-confirmation.mjs";
export const dynamic="force-dynamic";
function unavailable(){
 return NextResponse.json({service:"dealscope",operation:"fact_confirmation",status:"not_activated",
  message:"Secure customer confirmation is not yet activated."},
  {status:503,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
export async function GET(){return unavailable()}
export async function POST(request:Request){
 const services=getDealScopeAssessmentServices();
 if(!services)return unavailable();
 const result=await executeConfirmationRequest({request,services});
 return NextResponse.json(result.body,{status:result.status,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
