import React from "react";
import { Composition } from "remotion";
import { Image25Video } from "./Image25Video";
import { PaperclipDemo } from "./recipes/HardwareAnalysisRecipe";
import { DeepseekVideo } from "./recipes/ArchitectureSpecRecipe";
import { OxAlphaVideo } from "./OxAlphaVideo";

export const Root: React.FC = () => {
  return (
    <>
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
