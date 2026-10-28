/** Public, versioned product/role registry. No private pricing, models or costs. */
export const registryVersion="2026-10-28.1";
const material=(id,label,stage,routeTypes)=>Object.freeze({id,label,stage,routeTypes:Object.freeze(routeTypes)});
const direct=["direct_trade","own_stock"];
const raw=["direct_trade","process_feedstock","own_stock"];
const registry={
 chrome:{
  title:"Chrome",family:"metals_and_minerals",assessmentCapability:"indicative_chrome_only",
  roles:[
   "I supply material from a mine or stockpile","I represent a seller / mandate holder",
   "I buy material for direct resale","I buy feedstock to process and sell",
   "I have a buyer contract to fulfil","I produce and sell concentrate"
  ],
  materials:[
   material("rom_low","ROM — low grade","raw_feedstock",raw),
   material("rom_high","ROM — high grade","raw_feedstock",raw),
   material("sweepings","Chrome sweepings","secondary_feedstock",raw),
   material("tailings","Chrome tailings","secondary_feedstock",raw),
   material("fines","Chrome fines","raw_feedstock",raw),
   material("lumpy","Lumpy chrome ore","saleable_or_feedstock",raw),
   material("concentrate","Chrome concentrate","saleable_product",direct)
  ],qualityDimensions:["Cr2O3","Cr:Fe","sizing","moisture","impurities"],
  restrictions:["Plant recovery requires specific testwork","Tailings and sweepings do not inherit ROM recovery"]},
 coal:{
  title:"Coal",family:"energy",assessmentCapability:"intake_only",
  roles:["I supply coal from a mine or stockpile","I represent a seller / mandate holder",
   "I buy raw coal for direct resale","I buy coal to wash and sell",
   "I trade washed coal","I have a buyer contract to fulfil"],
  materials:[
   material("rom","ROM coal","raw_feedstock",raw),
   material("unwashed","Unwashed coal","raw_feedstock",raw),
   material("washed","Washed coal","saleable_product",direct),
   material("fines","Coal fines","raw_feedstock",raw),
   material("slurry","Slurry / discard","secondary_feedstock",raw),
   material("screened","Screened coal","saleable_product",direct)],
  qualityDimensions:["calorific value","ash","sulphur","moisture","size","volatile matter"],
  restrictions:["Washability yield requires float-sink or validated plant evidence"]},
 manganese:{
  title:"Manganese",family:"metals_and_minerals",assessmentCapability:"intake_only",
  roles:["I supply mine ore","I represent a seller / mandate holder","I buy ore for resale","I process or upgrade ore","I have an offtake contract"],
  materials:[material("ore","Manganese ore","raw_feedstock",raw),material("fines","Manganese fines","raw_feedstock",raw),
   material("lumps","Manganese lumps","saleable_product",direct),material("concentrate","Manganese concentrate","saleable_product",direct),
   material("tailings","Manganese tailings","secondary_feedstock",raw)],
  qualityDimensions:["Mn","Fe","P","SiO2","size","moisture"],restrictions:["Grade and impurity penalties are buyer-specific"]},
 lithium:{
  title:"Lithium",family:"battery_minerals",assessmentCapability:"intake_only",
  roles:["I supply lithium-bearing material","I trade lithium-bearing ore","I process lithium feedstock","I trade concentrate","I have an offtake contract"],
  materials:[material("ore","Lithium-bearing ore","raw_feedstock",raw),
   material("spodumene_concentrate","Spodumene concentrate","saleable_product",direct),
   material("lepidolite","Lepidolite-bearing material","raw_feedstock",raw)],
  qualityDimensions:["Li2O","mineralogy","moisture","deleterious elements"],restrictions:["Assay alone does not determine technical recovery"]},
 gold:{
  title:"Gold",family:"precious_metals",assessmentCapability:"intake_only",
  roles:["I supply mine production","I represent a lawful seller","I buy for direct resale","I intend to process material","I have a buyer contract to fulfil"],
  materials:[material("ore","Gold-bearing ore","raw_feedstock",raw),material("concentrate","Gold concentrate","saleable_product",direct),
   material("dore","Gold doré","regulated_product",direct),material("bullion","Refined gold bullion","regulated_product",direct)],
  qualityDimensions:["Au grade","assay basis","purity","payability"],restrictions:["Verify licensing, ownership, provenance and lawful dealing authority"]},
 diesel:{
  title:"Diesel",family:"petroleum",assessmentCapability:"intake_only",
  roles:["I am a licensed supplier","I represent a supplier / mandate holder","I procure bulk fuel for resale","I have a delivery contract to fulfil"],
  materials:[material("10ppm","Diesel 10ppm","refined_fuel",direct),
   material("50ppm","Diesel 50ppm","refined_fuel",direct),
   material("bulk","Bulk diesel supply","refined_fuel",direct)],
  qualityDimensions:["sulphur","density","volume basis","temperature"],restrictions:["Check licence status, duty and tax basis, product documentation"]},
 petrol:{
  title:"Petrol",family:"petroleum",assessmentCapability:"intake_only",
  roles:["I am a licensed supplier","I represent a supplier","I trade refined petrol","I have a delivery contract"],
  materials:[material("93","Petrol 93","refined_fuel",direct),material("95","Petrol 95","refined_fuel",direct)],
  qualityDimensions:["octane","fuel standard","temperature","volume basis"],restrictions:["Verify applicable SA fuel price rules and trading licence"]},
 crude_oil:{
  title:"Crude oil",family:"petroleum",assessmentCapability:"intake_only",
  roles:["I am a producer","I represent a lawful supplier","I trade crude","I have an offtake contract"],
  materials:[material("crude","Crude petroleum","crude_feedstock",direct)],
  qualityDimensions:["API gravity","sulphur","water/sediment","assay","barrel basis"],restrictions:["Export, customs, vessel and sanctions compliance require checks"]},
 platinum_group_metals:{
  title:"Platinum-group metals",family:"precious_metals",assessmentCapability:"intake_only",
  roles:["I supply mine concentrate","I represent a supplier","I trade refined PGM products","I have an offtake agreement"],
  materials:[material("concentrate","PGM concentrate","raw_feedstock",raw),material("refined","Refined PGM products","regulated_product",direct)],
  qualityDimensions:["Pt","Pd","Rh","payability","impurities"],restrictions:["Verify lawful dealing and refinery settlement"]},
 copper:{
  title:"Copper",family:"base_metals",assessmentCapability:"intake_only",
  roles:["I supply ore or scrap","I represent a supplier","I trade processed copper","I have an offtake contract"],
  materials:[material("ore","Copper ore","raw_feedstock",raw),material("concentrate","Copper concentrate","saleable_product",direct),material("cathode","Copper cathode","saleable_product",direct)],
  qualityDimensions:["Cu","impurities","moisture","assay"],restrictions:["Payability and penalty mechanisms are product-specific"]},
 iron_ore:{
  title:"Iron ore",family:"metals_and_minerals",assessmentCapability:"intake_only",
  roles:["I supply mine ore","I represent a supplier","I trade lump ore","I trade fines","I have an offtake contract"],
  materials:[material("lump","Iron ore lump","saleable_product",direct),material("fines","Iron ore fines","raw_feedstock",raw),material("concentrate","Iron ore concentrate","saleable_product",direct)],
  qualityDimensions:["Fe","SiO2","Al2O3","P","sizing","moisture"],restrictions:["Pricing requires product/basis-specific grade adjustments"]},
 diamonds:{
  title:"Diamonds",family:"precious_stones",assessmentCapability:"intake_only",
  roles:["I am an authorised producer","I am an authorised dealer","I represent a lawful principal","I hold a buyer mandate"],
  materials:[material("rough","Rough diamonds","regulated_product",direct),material("polished","Polished diamonds","regulated_product",direct)],
  qualityDimensions:["carat","quality","certificate","origin"],restrictions:["Licences, Kimberley Process rules and authentication are mandatory"]},
 silver:{
  title:"Silver",family:"precious_metals",assessmentCapability:"intake_only",
  roles:["I am a lawful supplier","I trade refined silver","I represent a supplier","I have an offtake agreement"],
  materials:[material("ore","Silver-bearing ore","raw_feedstock",raw),material("bullion","Silver bullion","regulated_product",direct)],
  qualityDimensions:["Ag content","purity","assay"],restrictions:["Confirm title and lawful precious-metal trading authority"]},
 nickel:{
  title:"Nickel",family:"battery_minerals",assessmentCapability:"intake_only",
  roles:["I supply ore","I trade nickel products","I represent a supplier","I process feedstock"],
  materials:[material("ore","Nickel ore","raw_feedstock",raw),material("concentrate","Nickel concentrate","saleable_product",direct)],
  qualityDimensions:["Ni","moisture","impurities"],restrictions:["Material-specific recovery and payability evidence required"]},
 cobalt:{
  title:"Cobalt",family:"battery_minerals",assessmentCapability:"intake_only",
  roles:["I supply cobalt-bearing material","I trade processed cobalt","I represent a supplier"],
  materials:[material("ore","Cobalt-bearing ore","raw_feedstock",raw),material("hydroxide","Cobalt hydroxide","saleable_product",direct)],
  qualityDimensions:["Co","moisture","impurities"],restrictions:["Supply-chain provenance and applicable due diligence required"]},
 lpg:{
  title:"LPG",family:"petroleum",assessmentCapability:"intake_only",
  roles:["I am a licensed supplier","I trade bulk LPG","I have a delivery contract"],
  materials:[material("bulk","Bulk LPG","refined_fuel",direct)],
  qualityDimensions:["composition","mass/volume basis","pressure"],restrictions:["Specialist handling and regulated fuel compliance"]},
};
export const commodityRegistry=Object.freeze(Object.fromEntries(Object.entries(registry).map(([id,p])=>[id,Object.freeze({...p,id,roles:Object.freeze(p.roles),materials:Object.freeze(p.materials),qualityDimensions:Object.freeze(p.qualityDimensions),restrictions:Object.freeze(p.restrictions)})])));
export const commodityIds=Object.freeze(Object.keys(commodityRegistry));
export function findSpecialist(commodity){return typeof commodity==="string"?commodityRegistry[commodity]??null:null;}
export function verifyMaterialRoute({commodity,materialForm,route}){
 const spec=findSpecialist(commodity);
 if(!spec)return {valid:false,reason:"unsupported_commodity"};
 const form=spec.materials.find(m=>m.label===materialForm);
 if(!form)return {valid:false,reason:"unsupported_material_form"};
 if(!["undecided",...form.routeTypes].includes(route))return {valid:false,reason:"incompatible_material_route"};
 return {valid:true,materialStage:form.stage,capability:spec.assessmentCapability,registryVersion};
}
