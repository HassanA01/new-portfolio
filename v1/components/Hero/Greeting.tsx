import { TypeAnimation } from "react-type-animation";

const Greeting = () => {
  return (
    <TypeAnimation
      sequence={[
        "Hey 👋🏽, I'm Aneeq.",
        1500,
        "Salut 👋🏽, c'est Aneeq.",
        1500,
        "Hola 👋🏽, soy Aneeq.",
        1500,
        ".مرحبا 👋🏽، أنا أنيق",
        1500,
        ".ہیلو 👋🏽، میں انیق ہوں",
        1500,
      ]}
      wrapper="span"
      speed={40}
      repeat={Infinity}
    />
  );
};

export default Greeting;
