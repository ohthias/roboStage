import "server-only";

export interface GithubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
}

const OWNER = "ohthias";
const REPO = "roboStage";

export async function getGithubReleases(): Promise<GithubRelease[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases`,
    {
      headers,
      next: {
        revalidate: 60 * 30, // 30 minutos
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar Releases do GitHub.");
  }

  const releases: GithubRelease[] = await response.json();

  return releases.filter(
    (release) => !release.draft && !release.prerelease
  );
}