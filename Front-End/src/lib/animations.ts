import { Variants } from "framer-motion";

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransitionConfig = {
  duration: 0.14,
  ease: "easeOut" as const,
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const slideInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

export const cardTap = {
  scale: 0.98,
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

export const magneticHover = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
};
