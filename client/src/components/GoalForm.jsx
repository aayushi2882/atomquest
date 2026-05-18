import { useState, useEffect } from "react";
import ValidationAlert from "./ValidationAlert";

const THRUST_AREAS = [
    "Customer Experience",
    "Revenue Growth",
    "Operational Excellence",
    "People & Culture",
    "Innovation & Technology",
    "Compliance & Risk",
    "Sustainability",
];

const UNITS = ["Numeric", "Percentage", "Timeline", "Zero-based"];

const EMPTY_FORM = {
    title: "",
    description: "",
    thrustArea: "",
    unit: "",
    target: "",
    weightage: "",
};

function GoalForm({ goals, onSave, onCancel, editGoal = null }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState([]);

    // Populate form when editing
    useEffect(() => {
        if (editGoal) {
            setForm({
                title: editGoal.title,
                description: editGoal.description,
                thrustArea: editGoal.thrustArea,
                unit: editGoal.unit,
                target: editGoal.target,
                weightage: editGoal.weightage,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors([]);
    }, [editGoal]);

    const totalWeightageUsed = goals
        .filter((g) => !editGoal || g.id !== editGoal.id)
        .reduce((sum, g) => sum + (parseInt(g.weightage) || 0), 0);

    const remainingWeightage = 100 - totalWeightageUsed;

    const validate = () => {
        const errs = [];

        if (!form.title.trim()) errs.push("Goal title is required.");
        if (!form.description.trim()) errs.push("Goal description is required.");
        if (!form.thrustArea) errs.push("Please select a thrust area.");
        if (!form.unit) errs.push("Please select a unit of measurement.");
        if (!form.target.trim()) errs.push("Target value is required.");

        const w = parseInt(form.weightage);
        if (!form.weightage || isNaN(w)) {
            errs.push("Weightage is required.");
        } else {
            if (w < 10) errs.push("Minimum weightage per goal is 10%.");
            if (w > remainingWeightage) {
                errs.push(`Weightage exceeds available allocation. Remaining: ${remainingWeightage}%.`);
            }
        }

        if (!editGoal && goals.length >= 8) {
            errs.push("Maximum of 8 goals allowed.");
        }

        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (errs.length) {
            setErrors(errs);
            return;
        }

        const goal = {
            id: editGoal ? editGoal.id : Date.now().toString(),
            ...form,
            status: editGoal ? editGoal.status : "Draft",
        };

        onSave(goal);
        setForm(EMPTY_FORM);
        setErrors([]);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors.length) setErrors([]);
    };

    const inputClass = "glass-input w-full rounded-xl px-3.5 py-2.5 text-sm";
    const labelClass = "block text-xs text-white/40 mb-1.5 uppercase tracking-widest font-medium";

    return (
        <div className="glass-card-elevated rounded-2xl p-6 fade-up">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {editGoal ? "Edit Goal" : "New Goal"}
                    </h3>
                    <p className="text-xs text-white/30 mt-0.5">
                        {editGoal ? "Update the details below" : `Goal ${goals.length + 1} of 8 · ${remainingWeightage}% remaining`}
                    </p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
                        Cancel
                    </button>
                )}
            </div>

            {errors.length > 0 && (
                <div className="mb-4">
                    <ValidationAlert messages={errors} type="error" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Title */}
                <div>
                    <label className={labelClass}>Goal Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Improve customer onboarding NPS"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className={inputClass}
                        maxLength={120}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        placeholder="Describe the goal and its expected impact..."
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className={`${inputClass} resize-none`}
                        rows={3}
                        maxLength={400}
                    />
                </div>

                {/* Thrust Area + Unit */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Thrust Area</label>
                        <select
                            value={form.thrustArea}
                            onChange={(e) => handleChange("thrustArea", e.target.value)}
                            className={`${inputClass} select glass-input`}
                        >
                            <option value="">Select area</option>
                            {THRUST_AREAS.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Unit of Measurement</label>
                        <select
                            value={form.unit}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            className={`${inputClass} select glass-input`}
                        >
                            <option value="">Select unit</option>
                            {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Target + Weightage */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Target</label>
                        <input
                            type="text"
                            placeholder={form.unit === "Percentage" ? "e.g. 95" : "e.g. 500"}
                            value={form.target}
                            onChange={(e) => handleChange("target", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            Weightage (%) 
                            <span className="ml-1 text-white/20">· max {remainingWeightage}%</span>
                        </label>
                        <input
                            type="number"
                            placeholder="10"
                            min={10}
                            max={remainingWeightage}
                            value={form.weightage}
                            onChange={(e) => handleChange("weightage", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Weightage visual hint */}
                {form.weightage && !isNaN(parseInt(form.weightage)) && (
                    <div>
                        <div className="flex justify-between text-[10px] text-white/25 mb-1.5">
                            <span>Proposed allocation</span>
                            <span>{totalWeightageUsed + parseInt(form.weightage)}% of 100%</span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    totalWeightageUsed + parseInt(form.weightage) > 100
                                        ? "bg-red-500"
                                        : "luminous-gradient"
                                }`}
                                style={{ width: `${Math.min(100, totalWeightageUsed + parseInt(form.weightage))}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-1"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                        {editGoal ? "save" : "add"}
                    </span>
                    {editGoal ? "Update Goal" : "Add Goal"}
                </button>
            </form>
        </div>
    );
}

export default GoalForm;
