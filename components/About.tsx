import Image from "next/image";
import {
  Gamepad2,
  Plane,
  Drumstick,
  Dumbbell,
  Globe,
  Medal,
} from "lucide-react";

const About = () => {
  return (
    <section id="about" className="min-h-screen w-full py-30">
      <div className="mx-auto flex max-w-[1000px] flex-col px-4">
        <h1 className="text-2xl font-bold text-teal-400">/ about</h1>

        <div className="mt-16 space-y-6 text-gray-300">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            <div className="space-y-4 sm:w-2/3">
              <p className="leading-relaxed">
                I&apos;m a recent graduate from{" "}
                <span className="font-medium text-teal-400 transition-colors hover:text-teal-300">
                  University of Toronto
                </span>{" "}
                where I specialized in{" "}
                <span className="font-medium text-gray-200">
                  computer science
                </span>
                .
              </p>

              <p className="leading-relaxed">
                Over the course of my journey, I&apos;ve been privileged to gain
                over 2 years of industry experience. I focus on building{" "}
                <span className="font-medium text-gray-200">AI solutions</span>{" "}
                and{" "}
                <span className="font-medium text-gray-200">
                  scalable systems
                </span>
                .
              </p>

              <p className="leading-relaxed">
                I&apos;m passionate about teaching and sharing knowledge. When
                not coding, you&apos;ll find me exploring new restaurants and
                experiencing different cuisines.
              </p>
            </div>

            {/* image container - hidden on mobile, shown on sm and up */}
            <div className="hidden sm:block sm:w-1/3">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800">
                <Image
                  src="/aneeq.jpg"
                  alt="About Me"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* hobbies section */}
          <div className="pt-6">
            <p className="mb-4 text-sm tracking-wider text-teal-400 uppercase">
              Things I enjoy
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {/* football */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Medal className="h-5 w-5 text-teal-400" />
                <span>Futbol</span>
              </div>

              {/* gaming */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Gamepad2 className="h-5 w-5 text-teal-400" />
                <span>Gaming</span>
              </div>

              {/* travel */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Plane className="h-5 w-5 text-teal-400" />
                <span>Travel</span>
              </div>

              {/* gym */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Dumbbell className="h-5 w-5 text-teal-400" />
                <span>Gym</span>
              </div>

              {/* foodie */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Drumstick className="h-5 w-5 text-teal-400" />
                <span>Foodie</span>
              </div>

              {/* doomscrolling */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <Globe className="h-5 w-5 text-teal-400" />
                <span>Doomscrolling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
