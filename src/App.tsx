import "./App.css";
import { cssVariablesBlock } from "./TreeVisualizer/colors";
import TreeVisualizer from "./TreeVisualizer/TreeVisualizer";

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
