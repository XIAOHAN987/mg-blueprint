import React from "react";
import { Composition } from "remotion";
import { Image25Video } from "./Image25Video";
import { PaperclipDemo } from "./recipes/HardwareAnalysisRecipe";
import { DeepseekVideo } from "./recipes/ArchitectureSpecRecipe";
import { NewParadigmRecipe } from "./recipes/NewParadigmRecipe";
import { OxAlphaVideo } from "./OxAlphaVideo";
import { NewParadigmVideo } from "./NewParadigmVideo";
import { PARADIGM_MOVES, ParadigmV2 } from "./v2/ParadigmV2";
import { GEMINI_MOVES, GeminiV2 } from "./v2/GeminiV2";
import { INTRO_MOVES, INTRO_TOTAL, IntroV2 } from "./v2/IntroV2";
import { checkFrames } from "./v2/space";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroV2"
        component={IntroV2}
        durationInFrames={INTRO_TOTAL}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ checkFrames: checkFrames(INTRO_MOVES, INTRO_TOTAL) }}
      />
      <Composition
        id="GeminiV2"
        component={GeminiV2}
        durationInFrames={640}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ checkFrames: checkFrames(GEMINI_MOVES, 640) }}
      />
      <Composition
        id="ParadigmV2"
        component={ParadigmV2}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ checkFrames: checkFrames(PARADIGM_MOVES, 720) }}
      />
      <Composition
        id="NewParadigmVideo"
        component={NewParadigmVideo}
        durationInFrames={3143}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NewParadigmRecipe"
        component={NewParadigmRecipe}
        durationInFrames={3143}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Image25Video"
        component={Image25Video}
        durationInFrames={1534}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="OxAlphaVideo"
        component={OxAlphaVideo}
        durationInFrames={1635}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PaperclipDemo"
        component={PaperclipDemo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DeepseekVideo"
        component={DeepseekVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
