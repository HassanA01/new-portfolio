const Footer = () => {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-[1000px] px-4 py-6">
        <p className="text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} Aneeq Hassan. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
