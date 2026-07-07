import { formatInr } from "@/lib/formatters";

export function formatCurrency(n) {
    return formatInr(n);
}
export function formatDuration(plan) {
    if (plan.isDurationUnlimited)
        return "Unlimited";
    return `${plan.duration} ${plan.durationUnit}`;
}
/** Returns a Tailwind gradient class based on the plan name */
const GRADIENT_MAP = {
    free: "from-slate-400 to-slate-600",
    trial: "from-amber-400 to-amber-600",
    basic: "from-blue-400 to-blue-600",
    starter: "from-cyan-400 to-cyan-600",
    standard: "from-violet-400 to-violet-600",
    premium: "from-orange-400 to-orange-600",
    enterprise: "from-rose-400 to-rose-600",
    pro: "from-emerald-400 to-emerald-600",
};
export function getPlanGradient(plan) {
    const lower = plan.name.toLowerCase();
    for (const [key, gradient] of Object.entries(GRADIENT_MAP)) {
        if (lower.includes(key))
            return gradient;
    }
    return "from-primary/70 to-primary";
}
