import TabLift from "./TabLift";

const ExperienceMobile = () => {
  return (
    <section id="experience" className="h-screen w-full">
      <div className="mx-auto flex h-full max-w-[1000px] flex-col px-4">
        <div className="w-full sm:mt-20">
          <div className="rounded-xl p-8">
            <h1 className="text-2xl font-bold text-teal-400">/ experience</h1>
            <div className="pt-10">
              <div id="jobs-container">
                <TabLift />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceMobile;
