/** Columns of the save grid. Shared by the 3D scene and the arrow keys. */
export function gridCols(count: number, width: number, height: number) {
  if (width < height * 1.05) return 2;
  return count > 6 ? 4 : 3;
}
