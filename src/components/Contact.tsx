import { Section } from "./Section";
import { site } from "@/content/site";

export function Contact() {
  return (
    <Section id="contact" title="Contact">
      <div className="max-w-2xl">
        <p className="text-lg leading-relaxed text-muted">
          I&apos;m open to new opportunities and collaborations. Whether you have
          a question or just want to say hi, my inbox is always open.
        </p>
        <a
          href={`mailto:${site.email}`}
          className="mt-6 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Say hello
        </a>
      </div>
    </Section>
  );
}
