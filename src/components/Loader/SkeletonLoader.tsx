import React from "react";
import { Loader2 } from "lucide-react";
import { useLoading } from "../../context/LoadingContext";

interface LoaderProps {
  type?: "skeleton" | "spinner";
  skeletonType?: "bar" | "circle" | "text" | "image" | "calendar";
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ type = "spinner", skeletonType = "bar", width = "100%", height = "20px", count = 1, animated = true }) => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  if (type === "skeleton") {
    return <SkeletonLoader type={skeletonType} width={width} height={height} count={count} animated={animated} />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <Loader2 size={32} className="animate-spin" />
    </div>
  );
};

interface SkeletonLoaderProps {
  type?: "bar" | "circle" | "text" | "image" | "calendar";
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = "bar", width = "100%", height = "20px", count = 1, animated = true }) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: "#e0e0e0",
    width,
    height,
    marginBottom: "10px",
    borderRadius: "4px",
  };

  const animationStyle: React.CSSProperties = animated
    ? {
        backgroundImage: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }
    : {};

  const styles = {
    ...baseStyle,
    ...animationStyle,
  };

  const renderSkeleton = () => {
    switch (type) {
      case "circle":
        return <div style={{ ...styles, borderRadius: "50%", aspectRatio: "1/1" }} />;
      case "image":
        return (
          <div style={{ ...styles, aspectRatio: "16/9", position: "relative" }}>
            <Loader2 style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          </div>
        );
      case "text":
        return (
          <>
            <div style={{ ...styles, width: "100%" }} />
            <div style={{ ...styles, width: "80%" }} />
            <div style={{ ...styles, width: "60%" }} />
          </>
        );
      case "calendar":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ ...styles, height: "40px" }} /> {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ ...styles, height: "30px" }} /> // Days of week
              ))}
            </div>
            {[...Array(5)].map((_, weekIndex) => (
              <div key={weekIndex} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
                {[...Array(7)].map((_, dayIndex) => (
                  <div key={dayIndex} style={{ ...styles, height: "80px" }} /> // Calendar cells
                ))}
              </div>
            ))}
          </div>
        );
      default:
        return <div style={styles} />;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default Loader;

// CSS for the shimmer animation
const style = document.createElement("style");
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);
