import { Container } from "./Container";

export function Section({
  id,
  eyebrow,
  title,
  children
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-semibold tracking-wide text-[hsl(var(--muted))]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 font-[var(--font-heading)] text-2xl leading-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}




