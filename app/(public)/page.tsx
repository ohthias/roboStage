import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import HomeHero from "@/components/home/HomeHero";
import {
  CanopySection,
  CommunitySection,
  CompetitionsSection,
  FaqSection,
  FinalCta,
  NewsSection,
  PersonasSection,
  PlatformIntro,
  SeasonsSection,
  ShowLiveSection,
  SpotlightSection,
  StepsSection,
  ToolsMarquee,
  ToolsSection,
  type HomeNews,
} from "@/components/home/HomeSections";
import { getLatestNews } from "@/utils/institutional/news";

export default async function Page() {
  const news: HomeNews[] = await getLatestNews(3);

  return (
    <>
      <Navbar />
      <HomeHero
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
        <ToolsMarquee />
        <PlatformIntro />
        <CompetitionsSection />
        <ToolsSection />
        <StepsSection />
        <PersonasSection />
        <SeasonsSection />
        <SpotlightSection />
        <ShowLiveSection />
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
