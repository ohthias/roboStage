import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import HeroSection from "@/components/UI/HeroSection";
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
  SpotlightSection,
  StepsSection,
  ToolsSection,
  type HomeNews,
} from "@/components/home/HomeSections";
import { getAllNews } from "@/utils/institutional/news";
import "@/components/home/home.css";

function latestNews(limit = 3): HomeNews[] {
  try {
    return (getAllNews() as (HomeNews & { draft?: boolean })[])
      .filter((n) => !n.draft && n.title)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export default function Page() {
  const news = latestNews();

  return (
    <>
      <Navbar />
      <HeroSection
        kicker="PLATAFORMA PARA EQUIPES DE ROBÓTICA"
        badges={[
          { label: "FLL", href: "/fll" },
          { label: "OBR", href: "/obr" },
          { label: "FTC", soon: true },
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
