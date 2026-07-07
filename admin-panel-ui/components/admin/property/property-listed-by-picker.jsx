import { Sel } from "../property/form-sections/shared-fields";
const LISTED_BY_OPTIONS = [
    "Owner",
    "Broker",
    "Builder"
];

export default function PropertyListedByPicker({ form, set, errors, disabled }) {
    return (
        <div className="mb-6">
            <Sel label="Listed By" value={form.propertyListedBy} onChange={(v) => set("propertyListedBy", v)} options={LISTED_BY_OPTIONS} placeholder="Select listed by" disabled={disabled} error={errors.propertyListedBy} />
        </div>
    );
}