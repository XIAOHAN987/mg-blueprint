import React from "react";
import { Composition } from "remotion";
import { PaperclipDemo } from "./recipes/HardwareAnalysisRecipe";
import { DeepseekVideo } from "./recipes/ArchitectureSpecRecipe";
import { MgIntro } from "./MgIntro";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MgIntro"
        component={MgIntro}
        durationInFrames={2865}
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
