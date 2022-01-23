import { createTheme, ThemeProvider } from "@mui/material";
import useResizeObserver from "@react-hook/resize-observer";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import classes from "./App.module.scss";

const dpr = () => window.devicePixelRatio ?? 1;
const useSize = (
  target: React.MutableRefObject<HTMLElement | undefined>
): DOMRect | Record<string, never> => {
  const [size, setSize] = useState<DOMRect | Record<string, never>>({});

  useLayoutEffect(() => {
    setSize(target.current?.getBoundingClientRect() ?? {});
  }, [target]);

  useResizeObserver(
    target as unknown as React.MutableRefObject<HTMLElement>,
    (entry) => setSize(entry.contentRect)
  );
  return size;
};
type FireworkParticle = {
  life: number;
  startLife: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: { r: number; g: number; b: number };
};
function App() {
  const containerRef = useRef<HTMLElement>();

  const nodesRef = useRef<FireworkParticle[]>([]);

  const { width: containerWidth = 1, height: containerHeight = 1 } =
    useSize(containerRef);
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasNode) {
      const dp = dpr();
      const width = containerWidth;
      const height = containerHeight;

      canvasNode.width = width * dp;
      canvasNode.height = height * dp;
      var context: CanvasRenderingContext2D = canvasNode.getContext(
        "2d"
      ) as CanvasRenderingContext2D;

      const tick = () => {
        context.resetTransform();
        context.scale(dp, dp);
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "rgba(0,0,0,0.1)";
        context.fillRect(0, 0, width, height);
        const scaleUnit = height / 10;

        if (Math.random() > 0.5) {
          nodesRef.current.push({
            x: Math.random() * width,
            y: height,
            vx: (Math.random() * 2 - 1) * scaleUnit,
            vy: -4 * scaleUnit + (Math.random() * 2 - 1) * scaleUnit * 2,
            color: { r: Math.random(), g: Math.random(), b: Math.random() },
            r: 2,
            life: 2000,
            startLife: 2000,
          });
        }
        const newNodes: FireworkParticle[] = [];
        for (let n of nodesRef.current) {
          n.life -= 1000 / 60;
          n.x += (n.vx * 1) / 60;
          n.y += (n.vy * 1) / 60;
          n.vy += (1 / 60) * 2 * scaleUnit;
          if (n.life > 0) {
            newNodes.push(n);
            let m = n.life / n.startLife + Math.log2(n.r) * 1;
            context.globalCompositeOperation = "lighter";
            context.fillStyle = `rgba(${Math.floor(
              n.color.r * 255 * m
            )},${Math.floor(n.color.g * 255 * m)},${Math.floor(
              n.color.b * 255 * m
            )},1)`;
            let rr = n.r;
            context.fillRect(n.x - rr / 2, n.y - rr / 2, rr, rr);
          } else {
            if (n.r > 1) {
              let nnr = n.r / 2;
              const c = {
                r: Math.random(),
                g: Math.random(),
                b: Math.random(),
              };
              for (let i = 0; i < 100; i++) {
                let oa = Math.random() * Math.PI * 2;
                let or = Math.random() + 0.1;
                let ox = Math.cos(oa) * or;
                let oy = Math.sin(oa) * or - 1;
                newNodes.push({
                  x: n.x,
                  y: n.y,
                  vx: ox * scaleUnit + n.vx * 0,
                  vy: oy * scaleUnit + n.vy * 0,
                  color: c,
                  r: nnr,
                  life: n.startLife / 2,
                  startLife: n.startLife / 2,
                });
              }
            }
          }
        }
        nodesRef.current = newNodes;
      };
      const handle = window.setInterval(tick, 1000 / 60);
      return () => {
        window.clearInterval(handle);
      };
    }
  }, [containerWidth, containerHeight]);

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
      <div className={classes.App}>
        <div
          className={classes.canvasContainer}
          ref={(el) => (containerRef.current = el ?? undefined)}
        >
          <canvas
            ref={(node) => setCanvasNode(node)}
            className={classes.canvas}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;