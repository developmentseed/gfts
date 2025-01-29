import { keyframes } from "@emotion/react";
import { timeFormat } from "d3";

export const fadeInKeyframes = keyframes`
  from { opacity: 0}
  to   { opacity: 1}
`;
export const fadeInAnimation = `${fadeInKeyframes} 0.32s ease-in-out`;

export const formatMonthYear = timeFormat('%b %Y');

export const DAY_WIDTH = 32;
export const DAY_HEIGHT = 24;

export const PADDING = {
  top: DAY_HEIGHT + 8,
  right: 36,
  bottom: 24,
  left: 50
};