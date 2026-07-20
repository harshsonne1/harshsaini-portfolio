type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-20 px-6 py-16">
      <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
        <span className="text-accent">#</span> {title}
      </h2>
      {children}
    </section>
  );
}
