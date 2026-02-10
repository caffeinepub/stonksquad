/**
 * Shared trading/alpha background component with layered treatment.
 * Renders the alpha-bg asset with opacity and gradient overlay for professional terminal aesthetic.
 */
export default function CyberBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-25">
      <img
        src="/assets/generated/alpha-bg.dim_1920x1080.png"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
    </div>
  );
}
