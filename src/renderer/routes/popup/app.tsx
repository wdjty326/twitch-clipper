import { FunctionComponent } from "react";

const App: FunctionComponent = () => (
  <div>
    <header>
      <h1>Chrome Extensions Template</h1>
    </header>
    <main>
      <article>
        <p>크롬 확장프로그램 탬플릿 입니다.</p>
		{typeof SharedArrayBuffer !== "undefined" ? "ok" : "false"}
      </article>
    </main>
  </div>
);

export default App;
