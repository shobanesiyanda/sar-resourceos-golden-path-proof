/** SAR architecture integrity guard — dependency-free, local-only.
 * Detects missing enterprise source-of-truth references and key architecture anchors.
 * Does not prove Founder sign-off, system implementation or completeness. */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const root=process.cwd();
const missing=[];
function read(path){const full=join(root,path);if(!existsSync(full)){missing.push("Missing file: "+path);return "";}
 return readFileSync(full,"utf8");}
function includes(path,needle){const content=read(path);if(!content.includes(needle))missing.push(path+" missing required section: "+needle);}
const spec=[
"docs/architecture/00-START-HERE.md",
"docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md",
"docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md",
"docs/architecture/03-DEALSCOPE-PLATFORM-ARCHITECTURE.md",
"docs/architecture/04-CROSS-SYSTEM-BOUNDARIES.md",
"docs/architecture/05-GOVERNANCE-COMPLETENESS-AND-DECISIONS.md",
"docs/architecture/07-DOCUMENT-DESIGN-AND-TEMPLATES.md",
"docs/architecture/08-RESOURCEOS-DOCUMENT-STUDIO.md",
"docs/architecture/06-DECISION-REGISTER.md",
"docs/architecture/2026-10-27-BLUEPRINT-AUDIT.md",
"docs/2026-10-27-sar-consolidated-carryforward.md",
"apps/dealscope/database/README.md","AGENTS.md","README.md"
];
for(const p of spec)read(p);
includes("README.md","docs/architecture/00-START-HERE.md");
includes("AGENTS.md","docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md");
includes("docs/architecture/00-START-HERE.md","2026-10-27-BLUEPRINT-AUDIT.md");
includes("docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md","Mining & Contract Services");
includes("docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md","Commodity Trading");
includes("docs/architecture/01-SAR-CORPORATE-OPERATING-MODEL.md","DealScope");
includes("docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md","that has not started");
includes("docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md","Document intelligence");
includes("docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md","RFQ");
includes("docs/architecture/02-RESOURCEOS-INTELLIGENCE-AND-EXECUTION.md","Inbound quotation");
includes("docs/architecture/03-DEALSCOPE-PLATFORM-ARCHITECTURE.md","no DealScope Supabase project");
includes("docs/architecture/04-CROSS-SYSTEM-BOUNDARIES.md","Possent Systems is unaffiliated");
includes("docs/architecture/05-GOVERNANCE-COMPLETENESS-AND-DECISIONS.md","Completeness register");
includes("docs/2026-10-27-sar-consolidated-carryforward.md","## 8. Foundational ResourceOS intelligent project analysis");
includes("docs/2026-10-27-sar-consolidated-carryforward.md","## 9. ResourceOS governed RFQ");
if(missing.length){console.error("SAR architecture integrity FAIL:\n"+missing.join("\n"));process.exitCode=1;}
else console.log("SAR architecture integrity PASS: "+spec.length+" files and required anchors present. Approval/completeness remain separate gates.");
