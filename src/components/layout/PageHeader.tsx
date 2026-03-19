interface PageHeaderProps {
  title: string;
  highlight: string;
  subtitle: string;
}

function PageHeader({ title, highlight, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center mb-8 mt-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        {title} <span style={{ color: 'var(--color-brand)' }}>{highlight}</span>
      </h1>
      <p className="text-gray-600 text-lg">{subtitle}</p>
    </div>
  );
}

export default PageHeader;
