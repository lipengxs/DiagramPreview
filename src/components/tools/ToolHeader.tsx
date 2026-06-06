type ToolHeaderProps = {
  h1: string;
  intro: string;
  badges: string[];
};

export function ToolHeader({h1, intro, badges}: ToolHeaderProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-blue-100">
                {badge}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{h1}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{intro}</p>
        </div>
      </div>
    </section>
  );
}
