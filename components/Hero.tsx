import ProfilePic from "../public/profile_pic.png";
import Image from "next/image";
import GrainBackground from "../public/grain.jpg";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative z-0 h-screen overflow-x-clip">
      <div
        className="absolute inset-0 -z-50 opacity-5"
        style={{
          backgroundImage: `url(${GrainBackground.src})`,
        }}
      ></div>
      <div className="hero-ring size-[620px]"></div>
      <div className="hero-ring size-[820px]"></div>
      <div className="hero-ring size-[1020px]"></div>
      <div className="hero-ring size-[1220px]"></div>
      <div className="mx-auto flex h-full max-w-[1000px] flex-col items-center pt-32 sm:justify-center sm:pt-0">
        <Image src={ProfilePic} alt="Me Coding" height={100} width={100} />
        <div className="my-2 inline-flex items-center gap-4 rounded-lg border border-gray-600 px-6 py-1.5">
          <div className="size-2.5 gap-4 rounded-full bg-green-500"></div>
          <div className="text-sm font-medium">Online</div>
        </div>
        <div className="max-w-2xl px-4 text-center sm:flex sm:flex-col">
          <h1 className="text-xl sm:text-2xl">Hey 👋🏽, I&apos;m Aneeq.</h1>
          <h1 className="text-2xl sm:text-3xl">Software Engineer</h1>
          <p className="mx-auto mt-2 max-w-xl">
            I&apos;m a software engineer based in Toronto, Canada. I specialize
            in developing scalable applications that deliver meaningful impact
            and drive real-world results.
          </p>
        </div>
        <div className="flex flex-col gap-4 py-8 sm:flex-row">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-8 py-4 text-lg font-semibold transition-colors hover:border-teal-500 hover:text-teal-500">
            <Image
              src="/resume.svg"
              alt="Resume"
              width={20}
              height={20}
              className="invert"
            />
            My Resume
          </button>
          <Link href="https://linkedin.com/in/hassana01" target="_blank">
            <button className="rounded-lg border border-teal-500 bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-teal-600 hover:bg-teal-600">
              Let&apos;s Connect!
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
