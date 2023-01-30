const allResourceType = Object.keys(
  chrome.declarativeNetRequest.ResourceType
).map(
  (key) =>
    chrome.declarativeNetRequest.ResourceType[
      key as keyof typeof chrome.declarativeNetRequest.ResourceType
    ]
);

const newRules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 100,
    priority: 100,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.APPEND,
          header: "cross-origin-resource-policy",
          value: "cross-origin",
        },
      ],
    },
    condition: {
      resourceTypes: [
        chrome.declarativeNetRequest.ResourceType.IMAGE,
        chrome.declarativeNetRequest.ResourceType.MEDIA,
      ],
    },
  },
  {
    id: 101,
    priority: 101,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.APPEND,
          header: "cross-origin-embedder-policy",
          value: "require-corp",
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.APPEND,
          header: "cross-origin-opener-policy",
          value: "same-origin",
        },
      ],
    },
    condition: {
      resourceTypes: [
        chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
      ],
    },
  },
];

chrome.declarativeNetRequest.updateDynamicRules({
  //removeRuleIds: previousRuleIds,
  addRules: newRules,
});

chrome.declarativeNetRequest.getDynamicRules((previousRules) => {
  console.log(previousRules);
  //  const previousRuleIds = previousRules.map((rule) => rule.id);
});
