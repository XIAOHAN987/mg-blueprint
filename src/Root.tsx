import React from "react";
import { Composition } from "remotion";
import { PaperclipDemo } from "./Demo";
import { DeepseekVideo } from "./Deepseek";

export const Root: React.FC = () => {
  return (
    <>
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
