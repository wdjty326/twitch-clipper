import { FunctionComponent, useEffect, useState } from "react";



interface PacketMessage {
  url: string;
}

const App: FunctionComponent = () => {
  const [packets, setPackets] = useState<string[]>([]);

  useEffect(() => {
    const callback = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      try {
        //const json = JSON.parse(message) as PacketMessage;
        if ("url" in message) {
          setPackets(packets.concat([message.url]));
        }
      } catch (e) {}
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, [packets]);

  return (
    <div>
      <header>
        <h1>Chrome Extensions Template</h1>
      </header>
      <main>
        <article>
          <p>크롬 확장프로그램 탬플릿 입니다.</p>
          {packets.map((url) => (
            <p>{url}</p>
          ))}
        </article>
      </main>
    </div>
  );
};

export default App;
