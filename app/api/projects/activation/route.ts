import {NextResponse} from "next/server";
import {getSARProjectActivationServices} from "../../../../lib/sar-project-activation-runtime.mjs";
import {executeActivationCommand} from "../../../../packages/project-core/src/activation-command.mjs";
export const dynamic="force-dynamic";
const unavailable=()=>NextResponse.json({service:"sar-resourceos",status:"not_activated",
  message:"Trusted SAR project activation authority is not connected."},{status:503,
  headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
export async function GET(){return unavailable();}
export async function POST(request:Request){
  const services=getSARProjectActivationServices();
  if(!services)return unavailable();
  const result=await executeActivationCommand({request,services});
  return NextResponse.json(result.body,{status:result.status,
    headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
}
