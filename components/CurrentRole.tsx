import Image from "next/image";

export default function CurrentRole() {
  return (
    <div className="current-role">
      <div className="current-role-summary">
        <Image
          className="current-role-logo"
          src="/company-logos/stripe.png"
          alt=""
          width={22}
          height={22}
        />
        <span>
          Currently @ <strong>Stripe</strong>
        </span>
      </div>
    </div>
  );
}
