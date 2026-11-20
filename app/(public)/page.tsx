import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import HeroSection from "@/components/UI/HeroSection";
import {
  CanopySection,
  CommunitySection,
  FaqSection,
  FinalCta,
  NewsSection,
  PersonasSection,
  PlatformIntro,
  SeasonsSection,
  SpotlightSection,
  StepsSection,
  ToolsSection,
  type HomeNews,
} from "@/components/home/HomeSections";
import { getLatestNews } from "@/utils/institutional/news";
import "@/components/home/home.css";
import { CompetitionsSection } from "@/components/home/CompetitionsSection";

export default async function Page() {
  const news: HomeNews[] = await getLatestNews(3);

  return (
    <>
      <Navbar />
      <HeroSection
        kicker="PLATAFORMA PARA EQUIPES DE ROBÓTICA"
        badges={[
          { label: "FLL", href: "/fll" },
          { label: "OBR", href: "/obr" },
          { label: "FTC", href: "/ftc" },
          { label: "WRO", soon: true },
        ]}
        scrollTarget="#conheca"
      />
      <main className="overflow-x-clip bg-base-100">
        <PlatformIntro />
        <CompetitionsSection />
        <ToolsSection />
        <StepsSection />
        <PersonasSection />
        <SeasonsSection />
        <SpotlightSection />
        <CanopySection />
        <NewsSection news={news} />
        <CommunitySection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
