/** Native scroll offset plus a bounded, progressively resistant edge pull. */
export function carouselPull(requested: number, maximum: number) {
  const scroll = Math.max(0, Math.min(Math.max(0, maximum), requested));
  const excess = scroll - requested;
  const pull = Math.sign(excess) * 44 * (1 - Math.exp(-Math.abs(excess) / 150));
  return { scroll, pull };
}
