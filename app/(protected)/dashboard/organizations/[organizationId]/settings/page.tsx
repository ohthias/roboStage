import { OrganizationProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body">
        <h1 className="card-title mb-6">Configurações</h1>

        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              navbar: "hidden",
              pageScrollBox: "p-0",
              card: "shadow-none border-none",
            },
          }}
        />
      </div>
    </div>
  );
}
