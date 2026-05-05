export type SocialPlatform = "linkedin" | "x" | "github";

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  socials: SocialLink[];
};

// Photo paths point to public/team/<file>. Drop the LinkedIn-downloaded
// images at these exact paths and they will load.
export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "chandan-kumar",
    name: "Chandan Kumar",
    role: "Founder & CEO",
    bio: "Building Zynd at Omnis AI. Shaping the infrastructure layer for autonomous agent collaboration and payments.",
    photo: "/team/chandan.png",
    socials: [
      { platform: "linkedin", url: "https://www.linkedin.com/in/chandankumar7654/" },
    ],
  },
  {
    slug: "james-chacko",
    name: "James Chacko",
    role: "Co-founder",
    bio: "Tech entrepreneur and startup operator based in the UK. Focused on innovation, ideation, and productization across early-stage ventures.",
    photo: "/team/james.jpg",
    socials: [
      { platform: "linkedin", url: "https://www.linkedin.com/in/james-chacko-9233a71/" },
    ],
  },
  {
    slug: "swapnil-shinde",
    name: "Swapnil Shinde",
    role: "Tech Lead",
    bio: "Web and blockchain engineer based in Pune. Building the developer-facing rails of the open agent network.",
    photo: "/team/swapnil.png",
    socials: [
      { platform: "linkedin", url: "https://www.linkedin.com/in/swapnil-shinde-5ba45118b/" },
      { platform: "github", url: "https://github.com/AtmegaBuzz" },
      { platform: "x", url: "https://twitter.com/a_kraken_head" },
    ],
  },
];
