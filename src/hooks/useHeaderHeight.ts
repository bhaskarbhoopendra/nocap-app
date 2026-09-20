import { useSafeAreaInsets } from "react-native-safe-area-context";

// AppHeader and BackHeader are both `position: absolute` overlays with an
// `h-16` (64px) inner row sitting below the device's safe-area top inset —
// every screen underneath has to pad its scroll content by that same total
// height or the header visually overlaps the first bit of content. This was
// previously a hardcoded `pt-24` (96px) className on each screen, tuned
// against whatever inset happened to be true on one test device — it broke
// the moment a device/emulator with a taller status bar inset came along.
const HEADER_CONTENT_HEIGHT = 64;

/** The real, current height of AppHeader/BackHeader on this device — use as
 * a screen's scroll content `paddingTop` instead of guessing a static value. */
export function useHeaderHeight(): number {
  const insets = useSafeAreaInsets();
  return insets.top + HEADER_CONTENT_HEIGHT;
}
