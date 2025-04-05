import ProfilePic from "../public/profile_pic.png";
import Image from "next/image";
import { Button } from "./ui/button";
const Hero = () => {
  return (
    <div className="h-screen">
      <div className="mx-auto flex h-full max-w-[1000px] flex-col items-center justify-start pt-32 sm:justify-center sm:pt-0">
        <Image src={ProfilePic} alt="Me Coding" height={100} width={100} />
        <div className="my-2 inline-flex items-center gap-4 rounded-lg border border-gray-600 px-6 py-1.5">
          <div className="size-2.5 gap-4 rounded-full bg-green-500"></div>
          <div className="text-sm font-medium">Online</div>
        </div>
        <div className="max-w-2xl px-4 text-center sm:flex sm:flex-col">
          <h1 className="text-xl sm:text-2xl">Hey 👋🏽, I'm Aneeq.</h1>
          <h1 className="text-2xl sm:text-3xl">Software Engineer</h1>
          <p className="mx-auto mt-2 max-w-xl">
            I'm a software engineer based in Toronto, Canada. I specialize in
            developing scalable applications that deliver meaningful impact and
            drive real-world results.
          </p>
        </div>
        <div className="flex flex-col gap-4 py-8 sm:flex-row">
          <Button variant="outline" className="px-8 py-6 text-lg font-semibold">
            My Resume
          </Button>
          <Button
            variant="outline"
            className="border-teal-500 bg-teal-500 px-8 py-6 text-lg font-semibold"
          >
            Let's Connect!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
