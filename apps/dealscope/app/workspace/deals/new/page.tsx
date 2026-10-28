import Link from "next/link";
import AssessmentJourney from "./AssessmentJourney";
import {getDealScopeAssessmentServices} from "../../../../lib/server/assessment-runtime.mjs";
export const dynamic="force-dynamic";
export const metadata={title:"DealScope | Private Deal Assessment",robots:{index:false,follow:false}};
export default async function CustomerDealAssessment(){
 const services=getDealScopeAssessmentServices();
 if(!services)return <main style={{minHeight:"100vh",background:"#0b111b",color:"#edf2f7",padding:"clamp(24px,8vw,96px)",fontFamily:"system-ui"}}>
  <div style={{maxWidth:750,margin:"auto"}}>
   <Link href="/" style={{color:"#36c68a",textDecoration:"none"}}>← DealScope</Link>
   <h1 style={{fontSize:"clamp(26px,6vw,44px)",marginTop:45}}>Your private assessment workspace is being activated.</h1>
   <p style={{lineHeight:1.7,color:"#bdccda"}}>The full DealScope assessment journey has been integrated into the application source, but private customer identity, secure document storage and the dedicated DealScope database have not passed release acceptance. No personal or deal records are collected here.</p>
   <p style={{lineHeight:1.7,color:"#bdccda"}}>Once a verified customer account is available, this workspace will support commodity-specific deal setup, document upload, pasted or manual information, confirmation of extracted facts, and a protected decision brief.</p>
   <p style={{fontSize:13,color:"#a8bbca"}}>Status: not activated. This page does not simulate sign-in or issue a financial assessment.</p>
  </div>
 </main>;
 try{
  const principal=await services.authenticatePage();
  if(!principal?.verified||!principal?.activeMembership||
     !principal?.entitledToAssessment||!principal?.currentLegalAcceptance)
    return <main style={{padding:"60px 24px",background:"#0b111b",minHeight:"100vh",color:"#fff"}}>
     <p>DealScope customer access has not been verified for this session.</p>
     <Link href="/start" style={{color:"#36c68a"}}>Return to account information</Link>
    </main>;
  return <AssessmentJourney/>;
 }catch{
  return <main style={{padding:"60px 24px",background:"#0b111b",minHeight:"100vh",color:"#fff"}}>
   <p>Secure customer session verification is unavailable. No deal information has been accepted.</p>
   <Link href="/" style={{color:"#36c68a"}}>Return to DealScope</Link>
  </main>;
 }
}
