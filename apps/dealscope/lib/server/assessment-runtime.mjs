/**
 * No customer data infrastructure is connected. SAR-controlled adapter must
 * implement authenticated tenant page/session checks and the service contract.
 * Never introduce a development auth bypass, anonymous deal access or another
 * company's Supabase credentials.
 *
 * @typedef {Object} DealScopeServices
 * @property {()=>Promise<{verified:boolean,activeMembership:boolean,entitledToAssessment:boolean,currentLegalAcceptance:boolean}>} authenticatePage
 * @property {(request:unknown)=>Promise<unknown>} authenticate
 * @property {(args:unknown)=>Promise<unknown>} readOwnedCase
 * @property {(args:unknown)=>Promise<unknown>} loadInternalReferences
 * @property {(args:unknown)=>Promise<unknown>} persistCandidate
 */
/** @returns {DealScopeServices|null} */
export function getDealScopeAssessmentServices(){return null;}
