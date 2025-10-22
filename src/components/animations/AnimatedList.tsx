import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListItemProps {
  children: ReactNode;
  index?: number;
}

function AnimatedListItem({ children, index = 0 }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedListItem;
