export function projectStackLayout(heights: number[], expanded: boolean) {
  let total = 0;
  const positions = heights.map((height, index) => {
    if (!expanded) return Math.min(index, 3) * 10;
    const top = total;
    total += height + 12;
    return top;
  });
  return {
    positions,
    height: expanded
      ? Math.max(0, total - 12)
      : (heights[0] ?? 0) + Math.min(Math.max(0, heights.length - 1), 3) * 10,
  };
}
