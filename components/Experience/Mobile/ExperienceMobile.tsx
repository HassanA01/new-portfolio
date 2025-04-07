import TabLift from "./TabLift";

const ExperienceMobile = () => {
  return (
    <section id="experience" className="min-h-screen w-full py-30">
      <div className="mx-auto flex max-w-[1000px] flex-col px-4">
        <h1 className="text-2xl font-bold text-teal-400">/ experience</h1>

        <div className="mt-16">
          <div id="jobs-container">
            <TabLift />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceMobile;
