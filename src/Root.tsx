import React from "react";
import { Composition } from "remotion";
import { Image25Video } from "./Image25Video";
import { PaperclipDemo } from "./recipes/HardwareAnalysisRecipe";
import { DeepseekVideo } from "./recipes/ArchitectureSpecRecipe";
import { NewParadigmRecipe } from "./recipes/NewParadigmRecipe";
import { OxAlphaVideo } from "./OxAlphaVideo";
import { NewParadigmVideo } from "./NewParadigmVideo";
import { ParadigmV2 } from "./v2/ParadigmV2";
import { GeminiV2 } from "./v2/GeminiV2";

export const Root: React.FC = () => {
  return (
    <>
      <Composition id="GeminiV2" component={GeminiV2} durationInFrames={640} fps={30} width={1920} height={1080} />
      <Composition id="ParadigmV2" component={ParadigmV2} durationInFrames={720} fps={30} width={1920} height={1080} />
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
