"use client";

import { EconomicsEditHeader } from "./EconomicsEditHeader";
import { InputControls } from "./EconomicsEditInputs";
import { LivePreview } from "./EconomicsEditPreview";

export { EconomicsEditHeader } from "./EconomicsEditHeader";
export { InputControls } from "./EconomicsEditInputs";
export { LivePreview } from "./EconomicsEditPreview";

export default function EconomicsEditTools() {
  return (
    <div className="space-y-6">
      <EconomicsEditHeader />
      <InputControls />
      <LivePreview />
    </div>
  );
}
