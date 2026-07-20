// Fixed, full-page background: dark gradient + animated noise (no grid).
// Adapted from a SectionNoise demo (github.com/ansh-dhanani style); the
// opacity slider is dropped in favor of a fixed 0.05 grain. The background is
// uniform — identical in light and dark (see .page-bg rules in globals.css).
export function PageBackground() {
  return (
    <div className="page-bg" aria-hidden="true">
      <div className="page-bg__layer page-bg__gradient" />
      <div className="page-bg__layer page-bg__noise" />
    </div>
  );
}
