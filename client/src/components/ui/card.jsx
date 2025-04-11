/* eslint-disable react/prop-types */

const Card = ({ className, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  );
};

const CardTitle = ({ className, ...props }) => {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
};

const CardContent = ({ className, ...props }) => {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
};

export function CardDescription({ className, ...props }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent };
//
// components/ui/card.jsx
