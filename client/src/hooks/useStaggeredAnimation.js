import { useEffect, useState } from 'react';

const useStaggeredAnimation = (itemCount, delay = 200) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const timeouts = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]));
      }, i * delay);
      
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [itemCount, delay]);

  return visibleItems;
};

export default useStaggeredAnimation;