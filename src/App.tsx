import "./App.css";
import { cssVariablesBlock } from "./colors";
import TreeVisualizer from "./TreeVisualizer";

export default function App() {
  return (
    <>
      <style>{cssVariablesBlock}</style>
      <div className="app">
        <TreeVisualizer />
      </div>
    </>
  );
}
