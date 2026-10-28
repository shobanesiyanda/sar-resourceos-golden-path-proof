import {redirect} from "next/navigation";
/** Compatibility route: the historical browser-side calculator is superseded.
 * Assessment results are issued only from the protected authenticated workspace.
 */
export default function LegacyDealRuns(){
 redirect("/workspace/deals/new");
}
