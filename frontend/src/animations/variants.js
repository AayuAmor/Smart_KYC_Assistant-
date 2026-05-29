export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)' },
  hover: { y: -4, boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.08)' },
}

export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}
