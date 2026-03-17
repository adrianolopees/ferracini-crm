import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListItemProps {
  children: ReactNode;
  index?: number;
}

function AnimatedListItem({ children, index = 0 }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index, 8) * 0.03,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedListItem;
