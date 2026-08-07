import { MonoDetail } from "./MonoDetail";

type Props = {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
};

export function Section({ id, index, title, children }: Props) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-6 py-24">
      <div className="mb-10 flex items-baseline gap-4">
        <MonoDetail>{index}</MonoDetail>
        <h2 className="text-xl font-medium tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
