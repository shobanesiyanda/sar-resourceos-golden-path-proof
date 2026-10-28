/**
 * DealScope manual form -> controlled customer-asserted fact map.
 * Never interprets source claims as issuer-verified; does not save or publish.
 * A trusted tenant storage adapter must hash/attach these values to the case.
 */
const string=(v,max=300)=>typeof v==="string"&&v.trim().length>0&&v.trim().length<=max;
const blocked=reason=>({state:"blocked",reason,sourceFacts:null});
function optionalPositiveAmount(v,limit){
 if(v===null||v===undefined||v==="")return {present:false,value:null};
 if(typeof v!=="string"||!/^\d+(?:\.\d{1,6})?$/.test(v.trim()))return {invalid:true};
 const amount=Number(v);
 if(!Number.isFinite(amount)||amount<=0||amount>limit)return {invalid:true};
 return {present:true,value:amount};
}
export function normaliseManualDealIntake({entryPoint,context,manual}){
 if(!["sale_contract","source_offer"].includes(entryPoint)||!context||!manual||
    !string(context.commodity)||!string(context.materialForm)||!string(context.commercialRole)||
    !string(context.deliveryTerm)||!["undecided","direct_trade","process_feedstock","own_stock"].includes(context.fulfilmentRoute))
  return blocked("Invalid manual commodity or transaction context");
 const facts={commodity:context.commodity.trim().toLowerCase(),
   material_form:context.materialForm.trim(),commercial_role:context.commercialRole.trim(),
   delivery_term:context.deliveryTerm.trim(),fulfilment_route:context.fulfilmentRoute};
 const map=entryPoint==="sale_contract"?{
  location:"delivery_location",quantity:"buyer_quantity_dry_t",grade:"buyer_product_grade_pct",
  price:"buyer_price_zar_per_dry_t"
 }:{
  location:"source_location",quantity:"feedstock_quantity_dry_t",grade:"feedstock_grade_pct",
  price:"source_purchase_price_zar_per_dry_t"
 };
 if(manual.deliveryLocation!==null&&manual.deliveryLocation!==undefined&&manual.deliveryLocation!==""){
  if(!string(manual.deliveryLocation))return blocked("Invalid source or delivery location");
  facts[map.location]=manual.deliveryLocation.trim();
 }
 const quantity=optionalPositiveAmount(manual.quantity,1e9);
 const grade=optionalPositiveAmount(manual.grade,100);
 const price=optionalPositiveAmount(entryPoint==="sale_contract"?manual.buyerPrice:manual.sourcePrice,1e12);
 if(quantity.invalid||grade.invalid||price.invalid)return blocked("Invalid quantity, assay grade or quoted unit price");
 if(quantity.present)facts[map.quantity]=quantity.value;
 if(grade.present)facts[map.grade]=grade.value;
 if(price.present)facts[map.price]=price.value;
 return {state:"customer_claims_prepared",sourceFacts:facts,independentlyVerified:false,
  entryPoint,quantityBasis:"dry tonnes asserted by customer, subject to contract, moisture and weighbridge confirmation"};
}
