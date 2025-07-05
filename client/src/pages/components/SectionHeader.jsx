import { memo } from 'react';

const SectionHeader = memo(({ title, subtitle, darkMode }) => {
  return (
    <div className="text-center mb-12">
      <h2
        className={`text-3xl font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        } mb-2`}
      >
        {title}
      </h2>
      <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {subtitle}
      </p>
    </div>
  );
});

export default SectionHeader;
