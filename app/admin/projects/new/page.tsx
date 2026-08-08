import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <h1 className="text-2xl font-medium tracking-tight text-ink">New project</h1>
      <ProjectForm row={null} />
    </>
  );
}
