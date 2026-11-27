import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import HomeHero from "@/features/home/components/HomeHero";
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
} from "@/features/home/components/HomeSections";
import { getLatestNews } from "@/features/institutional/lib/news";

export default async function Page() {
  const news: HomeNews[] = await getLatestNews(3);

  return (
    <>
      <Navbar />
      <HomeHero
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
