// command 사용시 확장프로그램 충돌로 직접 키를 입력받도록 처리
document.addEventListener("keydown", (event) => {
  const inputKeys = [];
  if (event.ctrlKey) inputKeys.push("Control");
  if (event.metaKey) inputKeys.push("Command");
  if (event.shiftKey) inputKeys.push("Shift");

  inputKeys.push(event.key);

  const commandLine = inputKeys.join("+");
  if (
    commandLine === ["Control", "Shift", "X"].join("+") || // Mac 대응
    commandLine === ["Command", "Shift", "X"].join("+")
  ) {
    chrome.runtime.sendMessage({ command: "run-foo" }, (response) => {
      console.log(response);
    });
  }
});
