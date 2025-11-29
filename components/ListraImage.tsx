import listra from "@/public/images/Listra.svg";

const ListraBanner = () => {
  return (
    <section className="w-full overflow-hidden">
      <div className="w-full">
        <img
          src={listra.src}
          alt="Listra"
          className="w-full h-auto max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-56 object-contain"
        />
      </div>
    </section>
  );
};

export default ListraBanner;
