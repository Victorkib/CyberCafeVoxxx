import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;
    
    // Number check
    if (/\d/.test(password)) strength += 1;
    
    // Special character check
    if (/[@$!%*?&]/.test(password)) strength += 1;
    
    return strength;
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
        return { text: 'Very Weak', color: 'bg-red-500' };
      case 1:
        return { text: 'Weak', color: 'bg-orange-500' };
      case 2:
        return { text: 'Fair', color: 'bg-yellow-500' };
      case 3:
        return { text: 'Good', color: 'bg-blue-500' };
      case 4:
      case 5:
        return { text: 'Strong', color: 'bg-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const strength = calculateStrength(password);
  const { text, color } = getStrengthText(strength);
  const percentage = (strength / 5) * 100;

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="h-2 w-full bg-gray-200 rounded-full">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-1 ${color.replace('bg-', 'text-')}`}>
        Password Strength: {text}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
