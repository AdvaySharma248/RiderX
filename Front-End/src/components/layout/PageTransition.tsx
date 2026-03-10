import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/animations";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransitionConfig}
    className="min-h-full"
  >
    {children}
  </motion.div>
);

export default PageTransition;
