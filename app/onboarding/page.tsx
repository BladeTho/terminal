import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default function Onboarding() {
  return (
    <div className="narrow" style={{ paddingTop: 34 }}>
      <OnboardingForm />
    </div>
  );
}
