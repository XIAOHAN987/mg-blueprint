import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export const HarnessSecurityCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 100, mass: 1 },
  });

  const defenses = [
    {
      title: "沙箱隔离 (Sanbox/gVisor)",
      desc: "宿主系统完全隔离，所有操作在临时虚拟容器中执行，销毁即还原本体。",
      badge: "ISOLATION",
    },
    {
      title: "危险命令阻断 (AST Guard)",
      desc: "正则与 AST 双重解析，物理拦截 rm -rf、格式化磁盘与破坏性外发。",
      badge: "BLOCKLIST",
    },
    {
      title: "权限白名单 (Zero Trust)",
      desc: "只开放项目工作区读写，系统核心配置与敏感凭据全量只读锁定。",
      badge: "READONLY",
    },
  ];

  return (
    <div
      style={{
        opacity: enter,
        transform: `scale(${enter})`,
        width: 1440,
        backgroundColor: "rgba(11, 13, 16, 0.92)",
        border: "1px solid rgba(76, 141, 255, 0.35)",
        borderRadius: 14,
        padding: "36px 44px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
        fontFamily: FONT.heading,
        color: COLOR.fg,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <span style={{ fontFamily: FONT.mono, fontSize: 18, color: COLOR.soft, letterSpacing: "0.15em" }}>
          SECURITY ARCHITECTURE // HARNESS DEFENSE SYSTEM
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 16,
            color: COLOR.accent,
            backgroundColor: "rgba(76, 141, 255, 0.12)",
            padding: "4px 12px",
            borderRadius: 4,
          }}
        >
          CONTAINERIZED ENCLAVE
        </span>
      </div>

      <div style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF", marginBottom: 24, textAlign: "left" }}>
        真正的关键：不是剥夺能力做玩具工具，而是 <span style={{ color: COLOR.accent }}>在外层搭好坚固的保安护栏</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {defenses.map((d, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              padding: "20px 20px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLOR.soft }}>{d.title}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 12, color: COLOR.dim }}>{d.badge}</div>
            </div>
            <div style={{ fontSize: 16, color: COLOR.dim, lineHeight: 1.5 }}>
              {d.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
