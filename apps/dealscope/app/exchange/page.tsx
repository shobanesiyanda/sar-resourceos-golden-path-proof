import {redirect} from "next/navigation";
/** Legacy, unreleased Exchange surface: superseded by private customer-submitted
 * Market Intelligence and Deal Intelligence. No marketplace or matching. */
export default function SupersededExchange(){
 redirect("/start");
}
