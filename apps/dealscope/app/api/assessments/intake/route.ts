import {NextResponse} from "next/server";
import {getDealScopeAssessmentServices} from "../../../../lib/server/assessment-runtime.mjs";
import {executeIntakeRequest} from "../../../../lib/server/intake-service.mjs";
export const dynamic="force-dynamic";
/** No files or customer data accepted until SAR-owned secure intake service
 * supplies authenticated tenant-scoped scanning, storage and extraction. */
function unavailable(){
 return NextResponse.json({service:"dealscope",operation:"deal_source_intake",status:"not_activated",
  message:"Secure customer document and text intake is not yet activated."},
  {status:503,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
export async function GET(){return unavailable()}
export async function POST(request:Request){
 const services=getDealScopeAssessmentServices();
 if(!services)return unavailable();
 const result=await executeIntakeRequest({request,services});
 return NextResponse.json(result.body,{status:result.status,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
