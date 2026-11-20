/* Stage UI — ponto de entrada da biblioteca de componentes do RoboStage. */

export * from "./lib";

// núcleo
export * from "./core/Button";
export * from "./core/Tag";
export * from "./core/Card";
export * from "./core/Heading";
export * from "./core/Form";
export * from "./core/Data";
export * from "./core/Interactive";
export * from "./core/Modals";
export * from "./core/Motion";
export * from "./core/Toasts";
export * from "./core/Typography";
export * from "./core/Media";
export * from "./core/MediaClient";

// decoração
export * from "./decor/Stickers";
export * from "./decor/Edges";
export * from "./decor/Marquee";

// layout
export * from "./layout/Brand";
export * from "./layout/Navbar";
export * from "./layout/Sections";
export * from "./layout/Sidebar";

// plataforma
export * from "./platform/MissionScorer";
export * from "./platform/Timer";
export * from "./platform/Competition";
export * from "./platform/Dashboard";
export * from "./platform/InfoCards";
export * from "./platform/Checklist";
export * from "./platform/MoreCards";
export * from "./platform/MoreCardsClient";

// capas
export * from "./covers/Covers";
export * from "./covers/CoverPicker";

// kit ferramenta (QuickBrick, StageBook, LabTest)
export * from "./tool/Tool";
