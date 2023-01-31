import { FunctionComponent, useEffect, useState } from "react";

interface PacketMessage {
  url: string;
}

const maximum = 120;

const App: FunctionComponent = () => {
  const [packets, setPackets] = useState<string[]>([]);

  useEffect(() => {
    const callback = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      try {
        if ("urls" in message) {
          setPackets(message.urls);
        }
      } catch (e) {
        console.error(e);
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, [packets]);

  return (
    <div>
      <header>
        <h1>Twitch Clipper</h1>
      </header>
      <main>
        <article>
          {packets.map((url) => (
            <p>{url}</p>
          ))}
        </article>
      </main>
    </div>
  );
};

export default App;
