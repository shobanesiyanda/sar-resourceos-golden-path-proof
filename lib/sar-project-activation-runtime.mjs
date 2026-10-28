/**
 * SAR BusinessOS/ResourceOS project authority adapter.
 * Deliberately disabled until the SAR-only database transaction writer,
 * identity, division and DoA roles, audit ledger and outbox are accepted.
 * Never substitute user-supplied JSON as a trusted actor or audit signature.
 */
export function getSARProjectActivationServices(){return null;}
